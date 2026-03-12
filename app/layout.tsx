import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mural de Oração — Comunidade de Intercessão",
  description:
    "Compartilhe seus pedidos de oração e interceda pelos outros. Ninguém precisa orar sozinho.",
  openGraph: {
    title: "Mural de Oração",
    description: "Ninguém precisa orar sozinho.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-cream text-navy font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
