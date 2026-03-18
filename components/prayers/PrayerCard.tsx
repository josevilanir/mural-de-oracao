"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { formatRelativeDate, CATEGORY_LABELS, STATUS_LABELS, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { prayAction, unprayAction } from "@/app/actions/prayers/pray";
import { deletePrayer } from "@/app/actions/prayers/delete";
import type { PrayerStatus, Category } from "@/types/prisma";

interface PrayerCardProps {
  prayer: {
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
  currentUserId?: string | null;
  userHasPrayed?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
}

export default function PrayerCard({
  prayer,
  currentUserId,
  userHasPrayed = false,
  isOwner = false,
  isAdmin = false,
}: PrayerCardProps) {
  const [hasPrayed, setHasPrayed] = useState(userHasPrayed);
  const [prayCount, setPrayCount] = useState(prayer._count?.actions ?? 0);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const cat = CATEGORY_LABELS[prayer.category];
  const status = STATUS_LABELS[prayer.status];

  const statusVariant =
    prayer.status === "ACTIVE"
      ? "active"
      : prayer.status === "CHRONIC"
      ? "chronic"
      : "answered";

  function handlePray() {
    if (!currentUserId || isPending) return;

    startTransition(async () => {
      if (hasPrayed) {
        const result = await unprayAction(prayer.id);
        if (result.success) {
          setHasPrayed(false);
          setPrayCount((prev) => prev - 1);
        }
      } else {
        const result = await prayAction(prayer.id);
        if (result.success) {
          setHasPrayed(true);
          setPrayCount((prev) => prev + 1);
        }
      }
    });
  }

  function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este pedido de oração?")) return;
    startDeleteTransition(async () => {
      const result = await deletePrayer(prayer.id);
      if (result.success) setIsDeleted(true);
    });
  }

  if (isDeleted) return null;

  const canDelete = isOwner || isAdmin;

  return (
    <div
      className={cn(
        "bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-gray-med/50 flex flex-col",
        isOwner && "border-l-4 border-l-gold-warm bg-gold-light/30"
      )}
    >
      {/* Top */}
      <div className="p-4 flex items-start justify-between gap-2">
        <Badge variant="category">
          {cat?.label}
        </Badge>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant}>
            {status?.label}
          </Badge>
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeletePending}
              className="text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
              title="Excluir pedido"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <Link href={`/pedido/${prayer.id}`} className="flex-1 px-4 pb-2 block group">
        <h3 className="font-semibold text-navy text-base leading-snug mb-1 group-hover:text-blue-main transition-colors line-clamp-2">
          {prayer.title}
        </h3>
        <p className="text-sm text-gray-text line-clamp-3 leading-relaxed">
          {prayer.description}
        </p>
        {prayer.status === "ANSWERED" && prayer.testimony && (
          <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/30 border-l-2 border-status-green rounded text-xs text-green-700 dark:text-green-400 line-clamp-2">
            {prayer.testimony}
          </div>
        )}
      </Link>

      {/* Footer */}
      <div className="px-4 pt-2 pb-3 border-t border-gray-med/50">
        <div className="flex items-center justify-between text-xs text-gray-text mb-2">
          <span>{formatRelativeDate(prayer.createdAt)}</span>
          {prayer.isAnonymous ? (
            <span>Anônimo</span>
          ) : (
            <span className="flex items-center gap-1.5">
              {prayer.author?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={prayer.author.image}
                  alt={prayer.author.name ?? ""}
                  className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <span className="w-4 h-4 rounded-full bg-gold-warm text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                  {(prayer.author?.name ?? "U").charAt(0).toUpperCase()}
                </span>
              )}
              <span>{prayer.author?.name ?? "Usuário"}</span>
            </span>
          )}
        </div>

        <button
          onClick={handlePray}
          disabled={!currentUserId || isPending}
          className={cn(
            "w-full py-2 rounded-md text-sm font-medium transition-all duration-200 border",
            hasPrayed
              ? "bg-blue-main text-white border-blue-main hover:bg-blue-700 hover:border-blue-700"
              : !currentUserId
              ? "bg-blue-soft text-gray-text border-blue-200 cursor-not-allowed opacity-70"
              : "bg-blue-soft text-navy border-blue-200 hover:bg-blue-main hover:text-white hover:border-blue-main"
          )}
          title={!currentUserId ? "Entre para orar" : hasPrayed ? "Clique para desfazer" : undefined}
        >
          {hasPrayed ? "Orei por você ✓" : "Orei por você"} ({prayCount})
          {isPending && <span className="ml-1 inline-block animate-spin">·</span>}
        </button>
      </div>
    </div>
  );
}
