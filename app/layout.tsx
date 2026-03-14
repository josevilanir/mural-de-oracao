import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import AppSidebar from "@/components/layout/AppSidebar";

export const metadata: Metadata = {
  title: "Mural de Oração — Comunidade de Intercessão",
  description: "Compartilhe seus pedidos de oração e interceda pelos outros. Ninguém precisa orar sozinho.",
  openGraph: {
    title: "Mural de Oração",
    description: "Ninguém precisa orar sozinho.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-cream text-navy font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="flex h-screen overflow-hidden">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
