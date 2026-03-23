"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <main className="container mx-auto max-w-md px-4 py-24 text-center">
      <div className="bg-card rounded-xl border border-gray-med/40 shadow-sm p-10 flex flex-col items-center gap-4">
        <span className="text-5xl">🙏</span>
        <h1 className="text-xl font-display font-bold text-navy">
          Algo deu errado
        </h1>
        <p className="text-sm text-gray-text">
          Ocorreu um erro inesperado. Tente novamente ou volte para o início.
        </p>
        <div className="flex gap-3 mt-2">
          <Button variant="primary" onClick={reset}>
            Tentar novamente
          </Button>
          <Button
            variant="secondary"
            onClick={() => (window.location.href = "/")}
          >
            Início
          </Button>
        </div>
      </div>
    </main>
  );
}
