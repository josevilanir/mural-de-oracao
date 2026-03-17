"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { requestGroupCreation } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";

function compressImage(file: File): Promise<string> {
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
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function NovoGrupoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const imageBase64Ref = useRef<string | null>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await compressImage(file);
    imageBase64Ref.current = base64;
    setPreview(base64);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      image: imageBase64Ref.current ?? undefined,
    };

    const result = await requestGroupCreation(data);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error ?? "Erro desconhecido.");
    }
  }

  if (success) {
    return (
      <main className="container mx-auto max-w-lg px-4 py-16 text-center">
        <div className="bg-card rounded-xl border border-gray-med/40 shadow-sm p-8">
          <div className="text-4xl mb-4">🙏</div>
          <h1 className="text-xl font-display font-bold text-navy mb-2">Solicitação enviada!</h1>
          <p className="text-gray-text mb-6">
            Sua solicitação foi enviada para aprovação. Você será notificado quando o grupo for aprovado!
          </p>
          <Button variant="primary" onClick={() => router.push("/grupos")}>
            Ver grupos
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-lg px-4 py-8">
      <div className="bg-card rounded-xl border border-gray-med/40 shadow-sm p-6">
        <h1 className="text-xl font-display font-bold text-navy mb-1">Solicitar criação de grupo</h1>
        <p className="text-sm text-gray-text mb-6">
          Sua solicitação será analisada por um administrador.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-navy mb-1">
              Nome do grupo <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={80}
              placeholder="Ex: GR dos Jovens"
              className="w-full border border-gray-med rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-warm bg-background text-navy"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-navy mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={500}
              placeholder="Descreva o propósito do grupo..."
              className="w-full border border-gray-med rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-warm bg-background text-navy resize-none"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-navy mb-1">
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
                  foto
                </div>
              )}
              <label
                htmlFor="image"
                className="cursor-pointer text-sm text-blue-main hover:underline"
              >
                {preview ? "Trocar foto" : "Escolher arquivo"}
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="text-xs text-gray-text mt-1">
              JPG, PNG ou WEBP. Será redimensionado para 200×200px automaticamente.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" variant="primary" size="md" disabled={loading}>
            {loading ? "Enviando..." : "Enviar solicitação"}
          </Button>
        </form>
      </div>
    </main>
  );
}
