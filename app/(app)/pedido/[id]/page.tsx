import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizePrayer, CATEGORY_LABELS, STATUS_LABELS, formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PrayButtonClient from "@/components/prayers/PrayButtonClient";
import CommentForm from "@/components/prayers/CommentForm";
import { DeletePrayerButton, DeleteCommentButton } from "@/components/prayers/DeleteButtons";
import type { PrayerStatus } from "@/types/prisma";

interface PrayerDetailPageProps {
  params: { id: string };
  searchParams: { marcar?: string };
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const prayer = await prisma.prayer.findUnique({
    where: { id: params.id },
    select: { title: true, description: true, isAnonymous: true, isHidden: true, author: { select: { name: true } } },
  });

  if (!prayer || prayer.isHidden) {
    return { title: "Mural de Oração" };
  }

  const raw = prayer.description.slice(0, 140) + (prayer.description.length > 140 ? "..." : "");
  const description =
    !prayer.isAnonymous && prayer.author?.name
      ? `Pedido de ${prayer.author.name} · ${raw}`
      : raw;

  const title = `${prayer.title} — Mural de Oração`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

const statusVariantMap: Record<PrayerStatus, "active" | "chronic" | "answered"> = {
  ACTIVE: "active",
  CHRONIC: "chronic",
  ANSWERED: "answered",
};

export default async function PrayerDetailPage({ params }: PrayerDetailPageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const prayer = await prisma.prayer.findUnique({
    where: { id: params.id, isHidden: false },
    include: {
      author: { select: { name: true, image: true, id: true } },
      _count: { select: { actions: true, comments: true } },
      comments: {
        include: {
          author: { select: { name: true, image: true, id: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!prayer) notFound();

  const sanitized = sanitizePrayer({ ...prayer, authorId: prayer.authorId });

  let hasPrayed = false;
  if (userId) {
    const existing = await prisma.prayerAction.findUnique({
      where: { userId_prayerId: { userId, prayerId: prayer.id } },
    });
    hasPrayed = !!existing;
  }

  const isOwner = !!userId && prayer.authorId === userId;
  const canDeletePrayer = isOwner || isAdmin;
  const cat = CATEGORY_LABELS[prayer.category];
  const status = STATUS_LABELS[prayer.status];

  return (
    <>
      <main className="container mx-auto max-w-2xl px-4 py-8">
        {/* Breadcrumb */}
        <Link href="/" className="text-sm text-gray-text hover:text-blue-main mb-4 inline-block">
          ← Voltar ao mural
        </Link>

        {/* Header do Pedido */}
        <div className="bg-card rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="category">{cat?.label}</Badge>
              <Badge variant={statusVariantMap[prayer.status as PrayerStatus]}>
                {status?.label}
              </Badge>
            </div>
            {canDeletePrayer && (
              <DeletePrayerButton prayerId={prayer.id} />
            )}
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-navy mb-3">
            {prayer.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-gray-text mb-4">
            <span>{formatRelativeDate(prayer.createdAt)}</span>
            <span>·</span>
            <span>
              {prayer.isAnonymous
                ? "Anônimo"
                : sanitized.author?.name ?? "Usuário"}
            </span>
          </div>

          {prayer.verseReference && (
            <div className="bg-blue-soft rounded-lg p-3 border border-blue-200 dark:border-blue-900 mb-4">
              <span className="text-sm italic text-navy">{prayer.verseReference}</span>
            </div>
          )}

          <p className="text-base text-navy leading-relaxed whitespace-pre-wrap">
            {prayer.description}
          </p>

          {/* Author actions */}
          {isOwner && prayer.status !== "ANSWERED" && (
            <div className="mt-4 pt-4 border-t border-gray-med/50">
              <Button asChild variant="primary" size="sm">
                <Link href={`/pedido/${prayer.id}/resolver`}>Marcar como Respondido</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Prayer Counter */}
        <div className="bg-card rounded-xl shadow-sm p-6 mb-4 text-center">
          <p className="text-gold-warm font-bold text-lg mb-3">
            {prayer._count.actions} pessoa{prayer._count.actions !== 1 ? "s" : ""} já{" "}
            {prayer._count.actions !== 1 ? "oraram" : "orou"} por este pedido
          </p>
          <PrayButtonClient
            prayerId={prayer.id}
            initialCount={prayer._count.actions}
            initialHasPrayed={hasPrayed}
            currentUserId={userId ?? null}
          />
        </div>

        {/* Testimony */}
        {prayer.status === "ANSWERED" && prayer.testimony && (
          <div className="bg-green-50 dark:bg-green-950/30 border-l-4 border-status-green rounded-lg p-5 mb-4">
            <h2 className="font-semibold text-green-700 dark:text-green-400 mb-2">Oração Respondida!</h2>
            <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">{prayer.testimony}</p>
          </div>
        )}

        {/* Comments */}
        {prayer.allowComments && (
          <div className="bg-card rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-navy mb-4">
              Palavras de Encorajamento ({prayer._count.comments})
            </h2>
            {prayer.comments.length === 0 ? (
              <p className="text-sm text-gray-text italic">
                Nenhum comentário ainda. Seja o primeiro a encorajar!
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {prayer.comments.map((comment: any) => {
                  const canDeleteComment = userId && (comment.author.id === userId || isAdmin);
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-soft flex items-center justify-center text-xs font-bold text-navy shrink-0">
                        {comment.author.name?.charAt(0) ?? "A"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-xs font-medium text-navy">
                            {comment.author.name ?? "Anônimo"}
                            <span className="ml-2 font-normal text-gray-text">
                              {formatRelativeDate(comment.createdAt)}
                            </span>
                          </p>
                          {canDeleteComment && (
                            <DeleteCommentButton commentId={comment.id} />
                          )}
                        </div>
                        <p className="text-sm text-navy mt-0.5">{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {userId ? (
              <CommentForm prayerId={prayer.id} />
            ) : (
              <p className="mt-4 text-sm text-gray-text border-t border-gray-med/50 pt-4">
                <Link href="/login" className="text-blue-main hover:underline">
                  Entre
                </Link>{" "}
                para deixar uma palavra de encorajamento.
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
