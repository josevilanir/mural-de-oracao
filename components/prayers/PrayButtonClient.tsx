"use client";

import { useState, useTransition } from "react";
import { prayAction } from "@/app/actions/prayers/pray";
import { cn } from "@/lib/utils";

interface PrayButtonClientProps {
  prayerId: string;
  initialCount: number;
  initialHasPrayed: boolean;
  currentUserId: string | null;
}

export default function PrayButtonClient({
  prayerId,
  initialCount,
  initialHasPrayed,
  currentUserId,
}: PrayButtonClientProps) {
  const [hasPrayed, setHasPrayed] = useState(initialHasPrayed);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handlePray() {
    if (!currentUserId || hasPrayed || isPending) return;

    startTransition(async () => {
      const result = await prayAction(prayerId);
      if (result.success) {
        setHasPrayed(true);
        setCount((prev) => prev + 1);
      }
    });
  }

  return (
    <button
      onClick={handlePray}
      disabled={!currentUserId || hasPrayed || isPending}
      className={cn(
        "w-full max-w-sm mx-auto py-3 rounded-lg text-base font-semibold transition-all duration-200 border",
        hasPrayed
          ? "bg-blue-main text-white border-blue-main cursor-not-allowed"
          : !currentUserId
          ? "bg-blue-soft text-gray-text border-blue-200 cursor-not-allowed opacity-70"
          : "bg-blue-soft text-navy border-blue-200 hover:bg-blue-main hover:text-white hover:border-blue-main"
      )}
      title={!currentUserId ? "Entre para orar" : undefined}
    >
      🙏 {hasPrayed ? "Você orou por este pedido" : "Orei por você"} ({count})
    </button>
  );
}
