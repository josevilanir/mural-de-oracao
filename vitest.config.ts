import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude, "e2e/**", "tests/setup/**"],
    setupFiles: ["tests/setup/jest-dom.ts"],
    coverage: {
      provider: "v8",
      include: ["app/actions/**", "app/api/**"],
      exclude: ["**/*.d.ts", "**/__mocks__/**"],
      reporter: ["text", "html"],
      thresholds: {
        lines: 65,
        functions: 65,
        branches: 65,
        statements: 65,
      },
    },
    projects: [
      // ── Unit tests (node environment) ──────────────────────────────────
      {
        plugins: [react()],
        test: {
          name: "unit",
          environment: "node",
          include: [
            "tests/actions/**/*.test.ts",
            "tests/api/**/*.test.ts",
            "tests/prayer-access-control.test.ts",
            "lib/**/*.test.ts",
          ],
          setupFiles: ["tests/setup/jest-dom.ts"],
        },
        resolve: {
          alias: { "@": path.resolve(__dirname, ".") },
        },
      },
      // ── Component tests (jsdom environment) ────────────────────────────
      {
        plugins: [react()],
        test: {
          name: "components",
          environment: "jsdom",
          include: ["tests/components/**/*.test.{ts,tsx}"],
          setupFiles: ["tests/setup/jest-dom.ts"],
        },
        resolve: {
          alias: { "@": path.resolve(__dirname, ".") },
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
