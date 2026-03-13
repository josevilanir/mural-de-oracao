"use client";

import { useState } from "react";
import { createCommentAction } from "@/app/actions/prayers/comment";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CommentForm({ prayerId }: { prayerId: string }) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await createCommentAction({ prayerId, text });

    if (result.success) {
      setText("");
      router.refresh();
    } else {
      setError(result.error ?? "Erro ao enviar comentário.");
    }
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-gray-med/50 pt-6">
      <h3 className="text-sm font-semibold text-navy mb-3">Deixe uma palavra de encorajamento</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escreva sua mensagem aqui..."
        rows={3}
        className="w-full px-3 py-2 rounded-md border border-gray-med bg-card text-sm text-navy placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-gold-warm resize-none mb-2"
        required
        minLength={3}
        maxLength={500}
      />
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || text.trim().length < 3}>
          {isSubmitting ? "Enviando..." : "Enviar Comentário"}
        </Button>
      </div>
    </form>
  );
}
