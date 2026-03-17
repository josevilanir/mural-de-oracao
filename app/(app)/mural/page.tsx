import { Suspense } from "react";
import { auth } from "@/lib/auth";
import FilterBar from "@/components/layout/FilterBar";
import PrayerCardSkeleton from "@/components/prayers/PrayerCardSkeleton";
import Link from "next/link";
import FeedLoadMore from "@/components/prayers/FeedLoadMore";
import { fetchFeedAction } from "@/app/actions/prayers/feed";

interface MuralProps {
  searchParams: {
    status?: string;
    category?: string;
  };
}

async function PrayerFeed({ searchParams }: MuralProps) {
  const { prayers, prayedIds, nextCursor, hasMore, currentUserId, isAdmin } =
    await fetchFeedAction({
      status: searchParams.status,
      category: searchParams.category,
      scope: "mural",
    });

  return (
    <FeedLoadMore
      initialPrayers={prayers as any[]}
      initialPrayedIds={prayedIds}
      initialNextCursor={nextCursor}
      initialHasMore={hasMore}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
      filters={{ status: searchParams.status, category: searchParams.category }}
      scope="mural"
    />
  );
}

export default async function MuralPage({ searchParams }: MuralProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <>
      <FilterBar />

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
