"use client";

import { useState, useTransition } from "react";
import PrayerCard from "@/components/prayers/PrayerCard";
import PrayerCardSkeleton from "@/components/prayers/PrayerCardSkeleton";
import { fetchFeedAction } from "@/app/actions/prayers/feed";
import { Button } from "@/components/ui/button";
import type { Category, PrayerStatus } from "@/types/prisma";

type PrayerItem = {
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

  if (prayers.length === 0) {
    return (
      <div className="col-span-full text-center text-gray-text py-12 text-sm">
        Nenhum pedido encontrado.
      </div>
    );
  }

  return (
    <>
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
