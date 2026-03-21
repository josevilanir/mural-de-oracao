"use client";

import { useState } from "react";
import { updatePasswordAction } from "@/app/actions/user/profile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ChangePasswordModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const form = e.currentTarget;
    const data = {
      currentPassword: (form.elements.namedItem("currentPassword") as HTMLInputElement).value,
      newPassword: (form.elements.namedItem("newPassword") as HTMLInputElement).value,
    };
    const result = await updatePasswordAction(data);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      form.reset();
    } else {
      setError(result.error ?? "Erro desconhecido.");
    }
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      setError(null);
      setSuccess(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Alterar senha
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-4 text-center">
            <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
              Senha alterada com sucesso!
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => setOpen(false)}
            >
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-navy mb-1"
              >
                Senha atual <span className="text-red-500">*</span>
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                className="w-full border border-gray-med rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-warm bg-background text-navy"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-navy mb-1"
              >
                Nova senha <span className="text-red-500">*</span>
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full border border-gray-med rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-warm bg-background text-navy"
              />
              <p className="text-xs text-gray-text mt-1">Mínimo 6 caracteres.</p>
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
                {loading ? "Salvando..." : "Alterar senha"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
