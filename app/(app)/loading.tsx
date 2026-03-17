import PrayerCardSkeleton from "@/components/prayers/PrayerCardSkeleton";

export default function Loading() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PrayerCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
