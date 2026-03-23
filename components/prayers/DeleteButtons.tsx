"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deletePrayer } from "@/app/actions/prayers/delete";
import { deleteCommentAction } from "@/app/actions/prayers/comment";

export function DeletePrayerButton({ prayerId }: { prayerId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este pedido de oração?"))
      return;
    startTransition(async () => {
      const result = await deletePrayer(prayerId);
      if (result.success) {
        router.push("/");
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
      title="Excluir pedido"
    >
      <Trash2 className="w-4 h-4" />
      {isPending ? "Excluindo..." : "Excluir pedido"}
    </button>
  );
}

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Excluir este comentário?")) return;
    startTransition(async () => {
      await deleteCommentAction(commentId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors ml-2"
      title="Excluir comentário"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
