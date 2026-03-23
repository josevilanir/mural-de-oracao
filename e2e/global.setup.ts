/**
 * Setup global: autentica um usuário de teste e salva o estado de auth.
 *
 * Estratégia:
 * 1. Tenta fazer login com as credenciais de teste
 * 2. Se falhar (usuário não existe), cria a conta via /register
 * 3. Salva cookies/storage em e2e/.auth/user.json para reutilização
 *
 * Credenciais configuráveis via variáveis de ambiente:
 *   E2E_TEST_NAME, E2E_TEST_EMAIL, E2E_TEST_PASSWORD
 */
import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { AUTH_FILE, TEST_USER } from "./helpers";

setup("autenticar usuário de teste", async ({ page }) => {
  const authDir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Tenta login primeiro (usuário já pode existir)
  await page.goto("/login");
  await page.getByPlaceholder("seu@email.com").fill(TEST_USER.email);
  await page.getByPlaceholder("••••••••").fill(TEST_USER.password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();

  // Wait for navigation away from /login (or silently continue if login failed)
  await page
    .waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10_000 })
    .catch(() => {});

  const loginFailed =
    page.url().includes("/login") ||
    (await page.getByText("E-mail ou senha inválidos.").isVisible());

  if (loginFailed) {
    // Usuário não existe — cadastra uma nova conta
    await page.goto("/register");
    await page.getByPlaceholder("Seu nome").fill(TEST_USER.name);
    await page.getByPlaceholder("seu@email.com").fill(TEST_USER.email);
    await page.getByPlaceholder("Mínimo 6 caracteres").fill(TEST_USER.password);
    await page
      .getByRole("button", { name: "Criar Conta", exact: true })
      .click();

    await page.waitForURL((url) => !url.pathname.includes("/register"), {
      timeout: 15_000,
    });
  }

  // Confirma que está autenticado
  await expect(page).not.toHaveURL(/\/(login|register)/, { timeout: 10_000 });

  // Salva estado de autenticação para os demais testes
  await page.context().storageState({ path: AUTH_FILE });
});
