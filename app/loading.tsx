import PrayerCardSkeleton from "@/components/prayers/PrayerCardSkeleton";
import Header from "@/components/layout/Header";

export default function Loading() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <PrayerCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </>
  );
}
