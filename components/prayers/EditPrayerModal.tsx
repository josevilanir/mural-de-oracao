"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePrayerAction } from "@/app/actions/prayers/update";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CATEGORY_LABELS } from "@/lib/utils";
import type { Category } from "@/types/prisma";

const CATEGORIES = [
  "HEALTH",
  "FAMILY",
  "FINANCES",
  "RELATIONSHIPS",
  "WORK_STUDY",
  "HOLINESS",
] as const;

interface Props {
  prayerId: string;
  initialTitle: string;
  initialDescription: string;
  initialCategory: Category;
  initialIsAnonymous: boolean;
  initialAllowComments: boolean;
}

export default function EditPrayerModal({
  prayerId,
  initialTitle,
  initialDescription,
  initialCategory,
  initialIsAnonymous,
  initialAllowComments,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const data = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      category: (form.elements.namedItem("category") as HTMLSelectElement).value,
      isAnonymous: (form.elements.namedItem("isAnonymous") as HTMLInputElement).checked,
      allowComments: (form.elements.namedItem("allowComments") as HTMLInputElement).checked,
    };
    const result = await updatePrayerAction(prayerId, data);
    setLoading(false);
    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error ?? "Erro desconhecido.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Editar pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar pedido de oração</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <label htmlFor="prayer-title" className="block text-sm font-medium text-navy mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="prayer-title"
              name="title"
              type="text"
              required
              minLength={5}
              maxLength={100}
              defaultValue={initialTitle}
              className="w-full border border-gray-med rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-warm bg-background text-navy"
            />
          </div>

          <div>
            <label
              htmlFor="prayer-description"
              className="block text-sm font-medium text-navy mb-1"
            >
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              id="prayer-description"
              name="description"
              required
              minLength={20}
              maxLength={1000}
              rows={5}
              defaultValue={initialDescription}
              className="w-full border border-gray-med rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-warm bg-background text-navy resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="prayer-category"
              className="block text-sm font-medium text-navy mb-1"
            >
              Categoria <span className="text-red-500">*</span>
            </label>
            <select
              id="prayer-category"
              name="category"
              defaultValue={initialCategory}
              className="w-full border border-gray-med rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-warm bg-background text-navy"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]?.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-navy">
              <input
                type="checkbox"
                name="isAnonymous"
                defaultChecked={initialIsAnonymous}
                className="w-4 h-4 rounded border-gray-med accent-gold-warm"
              />
              Publicar anonimamente
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-navy">
              <input
                type="checkbox"
                name="allowComments"
                defaultChecked={initialAllowComments}
                className="w-4 h-4 rounded border-gray-med accent-gold-warm"
              />
              Permitir comentários
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
