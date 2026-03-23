"use client";

import { useState, useTransition } from "react";
import { toggleHiddenAction } from "@/app/actions/admin/moderation";

interface AdminToggleProps {
  prayerId: string;
  initialHidden: boolean;
}

export default function AdminToggle({
  prayerId,
  initialHidden,
}: AdminToggleProps) {
  const [isHidden, setIsHidden] = useState(initialHidden);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const newValue = !isHidden;
      const result = await toggleHiddenAction(prayerId, newValue);
      if (result.success) setIsHidden(newValue);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        isHidden ? "bg-red-500" : "bg-green-500"
      } disabled:opacity-50`}
      title={
        isHidden
          ? "Oculto — clique para tornar visível"
          : "Visível — clique para ocultar"
      }
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          isHidden ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
