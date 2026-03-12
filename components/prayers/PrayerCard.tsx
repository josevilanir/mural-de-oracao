"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { formatRelativeDate, CATEGORY_LABELS, STATUS_LABELS, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { prayAction } from "@/app/actions/prayers/pray";
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
}

export default function PrayerCard({
  prayer,
  currentUserId,
  userHasPrayed = false,
  isOwner = false,
}: PrayerCardProps) {
  const [hasPrayed, setHasPrayed] = useState(userHasPrayed);
  const [prayCount, setPrayCount] = useState(prayer._count?.actions ?? 0);
  const [isPending, startTransition] = useTransition();

  const cat = CATEGORY_LABELS[prayer.category];
  const status = STATUS_LABELS[prayer.status];

  const statusVariant =
    prayer.status === "ACTIVE"
      ? "active"
      : prayer.status === "CHRONIC"
      ? "chronic"
      : "answered";

  function handlePray() {
    if (!currentUserId || hasPrayed || isPending) return;

    startTransition(async () => {
      const result = await prayAction(prayer.id);
      if (result.success) {
        setHasPrayed(true);
        setPrayCount((prev) => prev + 1);
      }
    });
  }

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-gray-100 flex flex-col",
        isOwner && "border-l-4 border-l-gold-warm bg-gold-light/30"
      )}
    >
      {/* Top */}
      <div className="p-4 flex items-start justify-between gap-2">
        <Badge variant="category">
          {cat?.emoji} {cat?.label}
        </Badge>
        <Badge variant={statusVariant}>
          {status?.emoji} {status?.label}
        </Badge>
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
          <div className="mt-2 p-2 bg-green-50 border-l-2 border-status-green rounded text-xs text-green-700 line-clamp-2">
            ✅ {prayer.testimony}
          </div>
        )}
      </Link>

      {/* Footer */}
      <div className="px-4 pt-2 pb-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-text mb-2">
          <span>⏱ {formatRelativeDate(prayer.createdAt)}</span>
          <span>
            {prayer.isAnonymous ? (
              <span className="flex items-center gap-1">
                <span className="text-gray-400">🕵️</span> Anônimo
              </span>
            ) : (
              <span>👤 {prayer.author?.name ?? "Usuário"}</span>
            )}
          </span>
        </div>

        <button
          onClick={handlePray}
          disabled={!currentUserId || hasPrayed || isPending}
          className={cn(
            "w-full py-2 rounded-md text-sm font-medium transition-all duration-200 border",
            hasPrayed
              ? "bg-blue-main text-white border-blue-main cursor-not-allowed"
              : !currentUserId
              ? "bg-blue-soft text-gray-text border-blue-200 cursor-not-allowed opacity-70"
              : "bg-blue-soft text-navy border-blue-200 hover:bg-blue-main hover:text-white hover:border-blue-main"
          )}
          title={!currentUserId ? "Entre para orar" : undefined}
        >
          🙏 Orei por você ({prayCount})
          {isPending && <span className="ml-1 animate-spin inline-block">⏳</span>}
        </button>
      </div>
    </div>
  );
}
