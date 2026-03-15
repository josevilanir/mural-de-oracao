import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizePrayers } from "@/lib/utils";
import FilterBar from "@/components/layout/FilterBar";
import PrayerCard from "@/components/prayers/PrayerCard";
import PrayerCardSkeleton from "@/components/prayers/PrayerCardSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import Link from "next/link";
import type { Category, PrayerStatus } from "@/types/prisma";

interface MuralProps {
  searchParams: {
    status?: string;
    category?: string;
  };
}

async function PrayerFeed({ searchParams }: MuralProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const whereStatus = searchParams.status as PrayerStatus | undefined;
  const whereCategory = searchParams.category as Category | undefined;

  const prayers = await prisma.prayer.findMany({
    where: {
      isHidden: false,
      ...(whereStatus ? { status: whereStatus } : {}),
      ...(whereCategory ? { category: whereCategory } : {}),
    },
    include: {
      author: { select: { name: true, image: true } },
      _count: { select: { actions: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const sanitized = sanitizePrayers(prayers as any[]);

  let prayedIds = new Set<string>();
  if (userId) {
    const prayedActions = await prisma.prayerAction.findMany({
      where: { userId, prayerId: { in: prayers.map((p: any) => p.id) } },
      select: { prayerId: true },
    });
    prayedIds = new Set(prayedActions.map((a: any) => a.prayerId));
  }

  if (sanitized.length === 0) {
    return (
      <EmptyState message="Seja o primeiro a publicar um pedido de oração hoje." />
    );
  }

  return (
    <>
      {sanitized.map((prayer: any) => (
        <PrayerCard
          key={prayer.id}
          prayer={prayer}
          currentUserId={userId}
          userHasPrayed={prayedIds.has(prayer.id)}
          isOwner={!!userId && prayer.authorId === userId}
          isAdmin={isAdmin}
        />
      ))}
    </>
  );
}

export default async function MuralPage({ searchParams }: MuralProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <>
      <FilterBar />

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Suspense
            fallback={Array.from({ length: 4 }).map((_, i) => (
              <PrayerCardSkeleton key={i} />
            ))}
          >
            <PrayerFeed searchParams={searchParams} />
          </Suspense>
        </div>
      </main>

      {isLoggedIn && (
        <Link
          href="/novo-pedido"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gold-warm text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-[#b0742f] transition-colors"
          title="Novo Pedido"
        >
          +
        </Link>
      )}
    </>
  );
}
