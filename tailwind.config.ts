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
        // ── Cores via variáveis CSS ──────────────────────────────────
        // O padrão `rgb(var(--x) / <alpha-value>)` permite modificadores
        // de opacidade do Tailwind (ex: bg-cream/95, text-navy/70).
        cream: "rgb(var(--cream) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        navy: "rgb(var(--navy) / <alpha-value>)",
        "blue-main": "rgb(var(--blue-main) / <alpha-value>)",
        "gold-warm": "rgb(var(--gold-warm) / <alpha-value>)",
        "gold-light": "rgb(var(--gold-light) / <alpha-value>)",
        "blue-soft": "rgb(var(--blue-soft) / <alpha-value>)",
        "gray-light": "rgb(var(--gray-light) / <alpha-value>)",
        "gray-med": "rgb(var(--gray-med) / <alpha-value>)",
        "gray-text": "rgb(var(--gray-text) / <alpha-value>)",
        "status-blue": "rgb(var(--status-blue) / <alpha-value>)",
        "status-amber": "rgb(var(--status-amber) / <alpha-value>)",
        "status-green": "rgb(var(--status-green) / <alpha-value>)",
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
