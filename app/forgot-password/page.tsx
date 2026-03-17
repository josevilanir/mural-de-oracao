"use client";

import { useState } from "react";
import { forgotPasswordAction } from "@/app/actions/user/password-reset";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    const result = await forgotPasswordAction(email);
    if (!result.success) {
      setError(result.error ?? "Erro ao enviar e-mail.");
      setStatus("idle");
    } else {
      setStatus("done");
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold text-navy mt-2">Esqueceu a senha?</h1>
          <p className="text-sm text-gray-text mt-1">
            Digite seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        {status === "done" ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-text">
              Se este e-mail estiver cadastrado, você receberá as instruções em breve.
            </p>
            <Link href="/login" className="mt-4 inline-block text-blue-main hover:underline text-sm font-medium">
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full h-10 px-3 rounded-md border border-gray-med text-sm text-navy placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-gold-warm"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded p-2">{error}</p>
            )}

            <Button type="submit" variant="primary" disabled={status === "loading"} className="w-full">
              {status === "loading" ? "Enviando..." : "Enviar link"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-text mt-4">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-blue-main hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
