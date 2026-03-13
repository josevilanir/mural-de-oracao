import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizePrayers, formatRelativeDate, CATEGORY_LABELS } from "@/lib/utils";
import Header from "@/components/layout/Header";
import FilterBar from "@/components/layout/FilterBar";
import PrayerCard from "@/components/prayers/PrayerCard";
import PrayerCardSkeleton from "@/components/prayers/PrayerCardSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Category, PrayerStatus } from "@/types/prisma";

interface HomeProps {
  searchParams: {
    status?: string;
    category?: string;
    cursor?: string;
  };
}

async function PrayerFeed({ searchParams }: HomeProps) {
  const session = await auth();
  const userId = session?.user?.id;

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

  // Check which prayers the current user has already prayed for
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
      <EmptyState
        message="Seja o primeiro a publicar um pedido de oração hoje 🙏"
        emoji="🕊️"
      />
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
        />
      ))}
    </>
  );
}

async function TestimonialsFeed() {
  const answeredPrayers = await prisma.prayer.findMany({
    where: {
      status: "ANSWERED",
      testimony: { not: null },
      isHidden: false,
    },
    include: {
      author: { select: { name: true, image: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 4,
  });

  const sanitized = sanitizePrayers(answeredPrayers as any[]);

  if (sanitized.length === 0) {
    return <p className="text-center text-sm text-gray-text italic">Nenhum testemunho ainda. Em breve!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sanitized.map((prayer: any) => (
        <div key={prayer.id} className="border-l-4 border-status-green bg-green-50 dark:bg-green-950/30 rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-navy">
                {prayer.isAnonymous ? "Anônimo" : prayer.author.name}
              </span>
              <span>·</span>
              <span>{CATEGORY_LABELS[prayer.category]?.label}</span>
            </div>
            <p className="text-sm text-navy line-clamp-3 mb-3">
              &quot;{prayer.testimony}&quot;
            </p>
          </div>
          <div className="text-xs text-status-green font-semibold flex items-center justify-between">
            <span>✅ Oração respondida</span>
            <span className="text-gray-500 dark:text-gray-400 font-normal">{formatRelativeDate(prayer.updatedAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
  }

export default async function HomePage({ searchParams }: HomeProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <>
      <Header />

      {/* Hero Banner — only for guests */}
      {!isLoggedIn && (
        <section className="mx-4 mt-4 mb-0 rounded-2xl overflow-hidden bg-gradient-to-br from-cream to-blue-soft px-6 py-10 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
            Bem-vindo ao Mural de Oração
          </h1>
          <p className="text-lg font-semibold text-navy/80 mb-1">
            Ninguém ora sozinho. Sua comunidade de fé ativa.
          </p>
          <p className="text-sm italic text-gray-text mb-6">
            Compartilhe suas necessidades e ore por outros.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="primary" size="lg">
              <Link href="/register">🙏 Criar minha conta</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="#feed">Explorar o mural ↓</a>
            </Button>
          </div>
        </section>
      )}

      <FilterBar />

      {/* Feed Grid */}
      <main id="feed" className="container mx-auto max-w-6xl px-4 py-8">
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

      {/* Journey of Faith section (for guests) */}
      {!isLoggedIn && (
        <section className="bg-card py-12 px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-navy mb-8">
            Sua Jornada de Fé Compartilhada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { emoji: "✏️", title: "Compartilhe", desc: "Publique seu pedido, anônimo se preferir" },
              { emoji: "🙏", title: "Ore", desc: "A comunidade intercede por você diariamente" },
              { emoji: "☀️", title: "Deus Responde", desc: "Compartilhe testemunhos de fé" },
            ].map((step) => (
              <div key={step.title} className="flex flex-col items-center gap-2">
                <span className="text-4xl">{step.emoji}</span>
                <h3 className="font-semibold text-navy text-lg">{step.title}</h3>
                <p className="text-gray-text text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild variant="primary" size="lg">
              <Link href="/register">Fazer parte da comunidade</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Testimonials section */}
      <section className="bg-cream py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-22px font-bold text-navy mb-6 text-center">
            Orações Respondidas 🙏
          </h2>
          <Suspense fallback={<div className="text-center text-gray-500">Carregando testemunhos...</div>}>
            <TestimonialsFeed />
          </Suspense>
        </div>
      </section>

      {/* FAB for logged-in users */}
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
