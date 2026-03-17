"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f8f9fa" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🙏</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#0a1628", marginBottom: "0.5rem" }}>
            Algo deu errado
          </h1>
          <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Ocorreu um erro inesperado na aplicação.
          </p>
          <button
            onClick={reset}
            style={{ padding: "0.75rem 1.5rem", background: "#c8912e", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
