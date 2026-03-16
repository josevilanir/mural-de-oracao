"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CreatePrayerSchema, type CreatePrayerInput } from "@/schemas/prayer";
import { createPrayerAction } from "@/app/actions/prayers/create";
import { CATEGORY_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Group {
  id: string;
  name: string;
}

interface Props {
  groups?: Group[];
  defaultGroupId?: string;
}

export default function NewPrayerForm({ groups = [], defaultGroupId }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(CreatePrayerSchema),
    defaultValues: {
      isAnonymous: false,
      allowComments: true,
      visibility: "PUBLIC" as const,
      groupId: defaultGroupId ?? "",
    },
  });

  const selectedGroupId = watch("groupId");

  const description = watch("description") ?? "";

  async function onSubmit(data: any) {
    setServerError(null);
    const result = await createPrayerAction(data);
    if (result.success) {
      router.push("/meus-pedidos");
      router.refresh();
    } else {
      setServerError(result.error ?? "Algo deu errado.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Título do Pedido <span className="text-red-500">*</span>
        </label>
        <input
          {...register("title")}
          placeholder="e.g., Cura para minha mãe"
          className="w-full h-10 px-3 rounded-md border border-gray-med bg-card text-sm text-navy placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-gold-warm"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Categoria <span className="text-red-500">*</span>
        </label>
        <select
          {...register("category")}
          className="w-full h-10 px-3 rounded-md border border-gray-med bg-card text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold-warm"
        >
          <option value="">Selecione uma categoria</option>
          {Object.entries(CATEGORY_LABELS).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Descrição do Pedido <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("description")}
          rows={5}
          placeholder="Conte sua necessidade em detalhes. A comunidade está aqui para orar por você."
          className="w-full px-3 py-2 rounded-md border border-gray-med bg-white text-sm text-navy placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-gold-warm resize-none"
        />
        <div className="text-right text-xs text-gray-text mt-1">
          {description.length} / 1000
        </div>
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Verse Reference */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Versículo de Referência{" "}
          <span className="text-xs text-gray-text">(opcional)</span>
        </label>
        <input
          {...register("verseReference")}
          placeholder="e.g., Filipenses 4:13"
          className="w-full h-10 px-3 rounded-md border border-gray-med bg-card text-sm text-navy placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-gold-warm"
        />
      </div>

      {/* Group selector */}
      {groups.length > 0 && (
        <div className="border border-gray-med rounded-lg p-4 flex flex-col gap-3 bg-blue-soft/20">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">
              Publicar em um grupo <span className="text-xs text-gray-text">(opcional)</span>
            </label>
            <select
              {...register("groupId")}
              className="w-full h-10 px-3 rounded-md border border-gray-med bg-card text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold-warm"
            >
              <option value="">Mural geral (sem grupo)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {selectedGroupId && (
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Visibilidade</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="PUBLIC"
                    {...register("visibility")}
                    className="accent-gold-warm"
                  />
                  <span className="text-sm text-navy">Público</span>
                  <span className="text-xs text-gray-text">(aparece no mural geral e do grupo)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="GROUP_ONLY"
                    {...register("visibility")}
                    className="accent-gold-warm"
                  />
                  <span className="text-sm text-navy">Só pro grupo</span>
                  <span className="text-xs text-gray-text">(apenas membros veem)</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Options */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            {...register("isAnonymous")}
            className="w-4 h-4 accent-gold-warm"
          />
          <span className="text-sm text-navy">Postar como anônimo</span>
          <span className="text-xs text-gray-text" title="Seu nome e foto não aparecerão no feed.">
            (seu nome e foto não aparecerão)
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register("allowComments")}
            defaultChecked
            className="w-4 h-4 accent-gold-warm"
          />
          <span className="text-sm text-navy">Permitir comentários de encorajamento</span>
        </label>
      </div>

      {serverError && (
        <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 rounded p-2">{serverError}</p>
      )}

      {/* Submit */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Publicando..." : "Publicar Pedido"}
        </Button>
      </div>
    </form>
  );
}
