"use client";

import { useState, useRef } from "react";
import { updateGroup } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX = 400;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas
          .getContext("2d")!
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Falha ao comprimir imagem"));
          },
          "image/jpeg",
          0.8,
        );
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface Props {
  groupId: string;
  initialName: string;
  initialDescription?: string | null;
  initialImage?: string | null;
}

export default function EditGroupModal({
  groupId,
  initialName,
  initialDescription,
  initialImage,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(initialImage ?? null);
  const imageUrlRef = useRef<string | null>(initialImage ?? null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setError(null);
    try {
      const blob = await compressImage(file);
      const res = await fetch(
        `/api/upload?contentType=${encodeURIComponent(blob.type)}&contentLength=${blob.size}`,
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Erro ao obter URL de upload.");
      }
      const { url, fields, publicUrl } = await res.json();
      const formData = new FormData();
      Object.entries(fields as Record<string, string>).forEach(([k, v]) =>
        formData.append(k, v),
      );
      formData.append("file", blob);
      const uploadRes = await fetch(url, { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Erro ao enviar imagem.");
      imageUrlRef.current = publicUrl;
      setPreview(URL.createObjectURL(blob));
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao processar imagem.",
      );
    } finally {
      setImageUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      description: (
        form.elements.namedItem("description") as HTMLTextAreaElement
      ).value,
      image: imageUrlRef.current ?? "",
    };
    const result = await updateGroup(groupId, data);
    setLoading(false);
    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error ?? "Erro desconhecido.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Editar grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar grupo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <label
              htmlFor="edit-name"
              className="block text-sm font-medium text-navy mb-1"
            >
              Nome do grupo <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              required
              maxLength={80}
              defaultValue={initialName}
              className="w-full border border-gray-med rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-warm bg-background text-navy"
            />
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium text-navy mb-1"
            >
              Descrição
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={3}
              maxLength={500}
              defaultValue={initialDescription ?? ""}
              className="w-full border border-gray-med rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-warm bg-background text-navy resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">
              Foto do grupo
            </label>
            <div className="flex items-center gap-4">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gold-warm flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gold-warm/10 border-2 border-dashed border-gold-warm/40 flex items-center justify-center text-gray-text text-xs flex-shrink-0">
                  {imageUploading ? "···" : "foto"}
                </div>
              )}
              <label
                htmlFor="edit-image"
                className={`cursor-pointer text-sm text-blue-main hover:underline ${
                  imageUploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {imageUploading
                  ? "Enviando..."
                  : preview
                    ? "Trocar foto"
                    : "Escolher arquivo"}
                <input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={imageUploading}
                />
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
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
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading || imageUploading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
