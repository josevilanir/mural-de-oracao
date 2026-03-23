"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resolveTestimonyAction } from "@/app/actions/prayers/resolve";
import { Button } from "@/components/ui/button";

export default function ResolverPedidoPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [testimony, setTestimony] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await resolveTestimonyAction({
      prayerId: params.id,
      testimony,
    });

    if (result.success) {
      router.push(`/pedido/${params.id}`);
      router.refresh();
    } else {
      setError(result.error ?? "Erro ao marcar como respondido.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <div className="bg-card rounded-xl shadow-xl p-8 border border-gray-100">
        <h1 className="font-display text-2xl font-bold text-navy mb-2">
          Que alegria! Compartilhe seu testemunho
        </h1>
        <p className="text-sm text-gray-text mb-6">
          Conte para a comunidade como Deus respondeu a esta oração.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Como Deus respondeu sua oração?{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={testimony}
              onChange={(e) => setTestimony(e.target.value)}
              rows={6}
              placeholder="Conte como Deus agiu..."
              className="w-full px-3 py-2 rounded-md border border-gray-med bg-card text-sm text-navy placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-gold-warm resize-none"
              required
              minLength={20}
              maxLength={2000}
            />
            <div className="text-right text-xs text-gray-text mt-1">
              {testimony.length} / 2000
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded p-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Confirmar e Publicar"}
            </Button>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">
            Seu testemunho será visível para toda a comunidade.
          </p>
        </form>
      </div>
    </div>
  );
}
