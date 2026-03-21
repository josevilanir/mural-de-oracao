"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { updateCommentAction } from "@/app/actions/prayers/comment";

interface Props {
  commentId: string;
  initialText: string;
}

export default function EditCommentInline({ commentId, initialText }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const [draft, setDraft] = useState(initialText);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startEdit() {
    setDraft(text);
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  function saveEdit() {
    if (draft.trim() === text) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const result = await updateCommentAction(commentId, { text: draft.trim() });
      if (result.success) {
        setText(draft.trim());
        setEditing(false);
      } else {
        setError(result.error ?? "Erro ao salvar.");
      }
    });
  }

  if (!editing) {
    return (
      <span className="group/comment relative">
        <span className="text-sm text-navy">{text}</span>
        <button
          onClick={startEdit}
          className="ml-2 opacity-0 group-hover/comment:opacity-100 text-gray-text hover:text-blue-main transition-opacity"
          title="Editar comentário"
        >
          <Pencil className="w-3 h-3 inline" />
        </button>
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        maxLength={500}
        rows={2}
        disabled={isPending}
        autoFocus
        className="w-full border border-gold-warm rounded-md px-2 py-1 text-sm text-navy bg-background focus:outline-none focus:ring-2 focus:ring-gold-warm resize-none"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          onClick={saveEdit}
          disabled={isPending || draft.trim().length < 3}
          className="text-green-600 hover:text-green-700 disabled:opacity-50 transition-colors"
          title="Salvar"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={cancelEdit}
          disabled={isPending}
          className="text-gray-text hover:text-red-500 transition-colors"
          title="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-text ml-auto">{draft.length}/500</span>
      </div>
    </div>
  );
}
