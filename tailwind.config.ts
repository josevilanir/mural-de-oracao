import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Cores Primárias ──────────────────────────────
        cream: "#FAF7F2",        // Background geral da aplicação
        navy: "#1E3A5F",         // Títulos principais, texto de peso
        "blue-main": "#3B82C4", // Links, ações primárias, destaques

        // ── Cores de Ação e Status ───────────────────────
        "gold-warm": "#C9853A",  // CTA principal (Publicar/Criar Conta)
        "gold-light": "#FEF3E2", // Background de CTAs secundários
        "blue-soft": "#D6E8F7",  // Cards, backgrounds informativos

        // ── Status dos Pedidos ───────────────────────────
        "status-blue": "#2E75B6",   // Badge 'Em Oração'
        "status-amber": "#E67E22",  // Badge 'Crônico'
        "status-green": "#27AE60",  // Badge 'Respondido'

        // ── Neutros e Suporte ────────────────────────────
        "gray-light": "#F5F4F0", // Fundo alternado, inputs
        "gray-med": "#D9D9D9",   // Bordas, separadores
        "gray-text": "#555555",  // Texto de suporte, labels, meta
      },
      fontFamily: {
        display: ["Lora", "serif"],
        sans: ["Nunito Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.08)",
        md: "0 4px 12px rgba(0,0,0,0.12)",
        lg: "0 8px 24px rgba(0,0,0,0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
