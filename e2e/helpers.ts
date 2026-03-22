/**
 * Constantes e helpers compartilhados entre setup e testes E2E.
 * Não use test.* aqui — este arquivo é importado por specs e pelo setup.
 */
import path from "path";

export const AUTH_FILE = path.join(__dirname, ".auth/user.json");

export const TEST_USER = {
  name: process.env.E2E_TEST_NAME || "Teste E2E",
  email: process.env.E2E_TEST_EMAIL || "e2e.test@mural.dev",
  password: process.env.E2E_TEST_PASSWORD || "Test@12345",
};
