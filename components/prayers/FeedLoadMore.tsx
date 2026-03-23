"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import PrayerCard from "@/components/prayers/PrayerCard";
import PrayerCardSkeleton from "@/components/prayers/PrayerCardSkeleton";
import { fetchFeedAction } from "@/app/actions/prayers/feed";
import { Button } from "@/components/ui/button";
import type { Category, PrayerStatus } from "@/types/prisma";

export type PrayerItem = {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: PrayerStatus;
  isAnonymous: boolean;
  allowComments: boolean;
  testimony?: string | null;
  verseReference?: string | null;
  createdAt: Date | string;
  authorId?: string | null;
  author?: { name: string | null; image: string | null } | null;
  _count?: { actions: number; comments: number };
};

interface Props {
  initialPrayers: PrayerItem[];
  initialPrayedIds: string[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  currentUserId: string | null;
  isAdmin: boolean;
  filters: { status?: string; category?: string };
  scope: "home" | "mural";
}

const POLL_INTERVAL = 30_000;

export default function FeedLoadMore({
  initialPrayers,
  initialPrayedIds,
  initialNextCursor,
  initialHasMore,
  currentUserId,
  isAdmin,
  filters,
  scope,
}: Props) {
  const [prayers, setPrayers] = useState<PrayerItem[]>(initialPrayers);
  const [prayedIds, setPrayedIds] = useState(new Set(initialPrayedIds));
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [cursor, setCursor] = useState(initialNextCursor);
  const [isPending, startTransition] = useTransition();

  // Pedidos novos aguardando exibição (banner "X novos pedidos")
  const [pendingPrayers, setPendingPrayers] = useState<PrayerItem[]>([]);
  const [pendingPrayedIds, setPendingPrayedIds] = useState<string[]>([]);

  // Ref para o timestamp do pedido mais recente já carregado
  const newestTimestampRef = useRef<string | null>(
    initialPrayers.length > 0
      ? new Date(initialPrayers[0].createdAt).toISOString()
      : null,
  );

  // Polling: busca pedidos criados após o mais recente já visível
  useEffect(() => {
    const interval = setInterval(async () => {
      if (document.hidden || !newestTimestampRef.current) return;

      const result = await fetchFeedAction({
        ...filters,
        scope,
        newerThan: newestTimestampRef.current,
      });

      if (result.prayers.length === 0) return;

      // Atualiza o timestamp de referência para o próximo poll
      newestTimestampRef.current = new Date(
        result.prayers[0].createdAt,
      ).toISOString();

      setPendingPrayers((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const novos = (result.prayers as PrayerItem[]).filter(
          (p) => !existingIds.has(p.id),
        );
        return [...novos, ...prev];
      });

      setPendingPrayedIds((prev) => [...result.prayedIds, ...prev]);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Filtros e scope não mudam durante a vida do componente

  function showPendingPrayers() {
    setPrayers((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const novos = pendingPrayers.filter((p) => !existingIds.has(p.id));
      return [...novos, ...prev];
    });
    setPrayedIds((prev) => {
      const next = new Set(prev);
      pendingPrayedIds.forEach((id) => next.add(id));
      return next;
    });
    setPendingPrayers([]);
    setPendingPrayedIds([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function loadMore() {
    startTransition(async () => {
      const result = await fetchFeedAction({ cursor, ...filters, scope });
      setPrayers((prev) => [...prev, ...(result.prayers as PrayerItem[])]);
      setPrayedIds((prev) => {
        const next = new Set(prev);
        result.prayedIds.forEach((id) => next.add(id));
        return next;
      });
      setHasMore(result.hasMore);
      setCursor(result.nextCursor);
    });
  }

  if (prayers.length === 0 && pendingPrayers.length === 0) {
    return (
      <div className="col-span-full text-center text-gray-text py-12 text-sm">
        Nenhum pedido encontrado.
      </div>
    );
  }

  return (
    <>
      {/* Banner de novos pedidos */}
      {pendingPrayers.length > 0 && (
        <div className="col-span-full flex justify-center mb-2 sticky top-4 z-10">
          <button
            onClick={showPendingPrayers}
            className="bg-blue-main text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg hover:opacity-90 transition-opacity animate-in fade-in slide-in-from-top-2 duration-300"
          >
            {pendingPrayers.length === 1
              ? "1 novo pedido — ver"
              : `${pendingPrayers.length} novos pedidos — ver`}
          </button>
        </div>
      )}

      {prayers.map((prayer) => (
        <PrayerCard
          key={prayer.id}
          prayer={prayer}
          currentUserId={currentUserId}
          userHasPrayed={prayedIds.has(prayer.id)}
          isOwner={!!currentUserId && prayer.authorId === currentUserId}
          isAdmin={isAdmin}
        />
      ))}

      {isPending &&
        Array.from({ length: 3 }).map((_, i) => (
          <PrayerCardSkeleton key={`skeleton-${i}`} />
        ))}

      {!isPending && hasMore && (
        <div className="col-span-full flex justify-center mt-4">
          <Button variant="secondary" onClick={loadMore}>
            Carregar mais
          </Button>
        </div>
      )}
    </>
  );
}
