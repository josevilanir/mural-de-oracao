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
}

export async function fetchFeedAction({ cursor, status, category, scope }: FetchFeedInput) {
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  const prayers = await prisma.prayer.findMany({
    where: {
      isHidden: false,
      ...(scope === "home" ? { OR: [{ groupId: null }, { visibility: "PUBLIC" }] } : {}),
      ...(status ? { status: status as PrayerStatus } : {}),
      ...(category ? { category: category as Category } : {}),
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    include: {
      author: { select: { name: true, image: true } },
      _count: { select: { actions: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: FEED_PAGE_SIZE + 1, // +1 para detectar se há próxima página
  });

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
