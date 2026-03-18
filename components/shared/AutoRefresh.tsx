"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  /** Intervalo em ms. Padrão: 30 segundos. */
  interval?: number;
}

/**
 * Componente invisível que chama router.refresh() periodicamente,
 * pausando automaticamente quando a aba está oculta.
 * Adicione a qualquer página SSR para mantê-la atualizada.
 */
export function AutoRefresh({ interval = 30_000 }: Props) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      router.refresh();
    }, interval);
    return () => clearInterval(id);
  }, [router, interval]);

  return null;
}
