"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizePrayers } from "@/lib/utils";
import type { Category, PrayerStatus } from "@/types/prisma";

const FEED_PAGE_SIZE = 12;

interface FetchFeedInput {
  cursor?: string | null;
  status?: string;
  category?: string;
  /** "home" mostra apenas pedidos públicos/sem grupo; "mural" mostra todos não-ocultos */
  scope: "home" | "mural";
  /** ISO timestamp — quando informado, retorna apenas pedidos criados APÓS essa data (polling de novos itens) */
  newerThan?: string | null;
}

export async function fetchFeedAction({ cursor, status, category, scope, newerThan }: FetchFeedInput) {
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  const dateFilter = newerThan
    ? { createdAt: { gt: new Date(newerThan) } }
    : cursor
    ? { createdAt: { lt: new Date(cursor) } }
    : {};

  const prayers = await prisma.prayer.findMany({
    where: {
      isHidden: false,
      // scope: 'mural' intentionally shows ALL non-hidden prayers regardless of visibility.
      // Unlike 'home' (which excludes GROUP_ONLY group prayers), the mural is a complete view
      // for logged-in users. GROUP_ONLY prayers are visible here because the mural serves as
      // the admin/community overview. Access control for individual prayer detail pages is
      // handled separately by canAccessPrayer() in lib/services/prayer-access.ts.
      ...(scope === "home" ? { OR: [{ groupId: null }, { visibility: "PUBLIC" }] } : {}),
      ...(status ? { status: status as PrayerStatus } : {}),
      ...(category ? { category: category as Category } : {}),
      ...dateFilter,
    },
    include: {
      author: { select: { name: true, image: true } },
      _count: { select: { actions: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    // Quando buscando itens mais novos, limite generoso mas sem paginação extra
    take: newerThan ? 50 : FEED_PAGE_SIZE + 1,
  });

  // Quando buscando novos itens (newerThan), retorna sem lógica de paginação
  if (newerThan) {
    const sanitized = sanitizePrayers(prayers);
    let prayedIds: string[] = [];
    if (userId && prayers.length > 0) {
      const prayedActions = await prisma.prayerAction.findMany({
        where: { userId, prayerId: { in: prayers.map((p) => p.id) } },
        select: { prayerId: true },
      });
      prayedIds = prayedActions.map((a) => a.prayerId);
    }
    return { prayers: sanitized, prayedIds, nextCursor: null, hasMore: false, currentUserId: userId ?? null, isAdmin };
  }

  const hasMore = prayers.length > FEED_PAGE_SIZE;
  const items = hasMore ? prayers.slice(0, FEED_PAGE_SIZE) : prayers;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  const sanitized = sanitizePrayers(items);

  let prayedIds: string[] = [];
  if (userId) {
    const prayedActions = await prisma.prayerAction.findMany({
      where: { userId, prayerId: { in: items.map((p) => p.id) } },
      select: { prayerId: true },
    });
    prayedIds = prayedActions.map((a) => a.prayerId);
  }

  return {
    prayers: sanitized,
    prayedIds,
    nextCursor,
    hasMore,
    currentUserId: userId ?? null,
    isAdmin,
  };
}
