"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPasswordAction } from "@/app/actions/user/password-reset";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-500">Link inválido ou expirado.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-blue-main hover:underline text-sm font-medium">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setStatus("loading");
    const result = await resetPasswordAction(token, password);
    if (!result.success) {
      setError(result.error ?? "Erro ao redefinir senha.");
      setStatus("idle");
    } else {
      setStatus("done");
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-text">Senha redefinida com sucesso! Redirecionando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-navy mb-1">Nova senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          className="w-full h-10 px-3 rounded-md border border-gray-med text-sm text-navy placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-gold-warm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">Confirmar senha</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          className="w-full h-10 px-3 rounded-md border border-gray-med text-sm text-navy placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-gold-warm"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded p-2">{error}</p>
      )}

      <Button type="submit" variant="primary" disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Salvando..." : "Redefinir senha"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold text-navy mt-2">Redefinir senha</h1>
          <p className="text-sm text-gray-text mt-1">Digite sua nova senha abaixo.</p>
        </div>

        <Suspense fallback={<div className="h-32" />}>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm text-gray-text mt-4">
          <Link href="/login" className="text-blue-main hover:underline font-medium">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
