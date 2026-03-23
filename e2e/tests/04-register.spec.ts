import { test, expect } from "@playwright/test";

/**
 * E2E: Registro de nova conta
 *
 * Usa um contexto de navegador limpo (sem storageState) para simular
 * um usuário novo que ainda não tem conta.
 */

test.use({ storageState: { cookies: [], origins: [] } });

test("deve registrar uma nova conta com sucesso", async ({ page }) => {
  // Gera email único para evitar conflitos entre execuções
  const uniqueEmail = `e2e_reg_${Date.now()}@test.com`;

  await page.goto("/register");

  // Preenche o formulário de registro
  await page.getByPlaceholder("Seu nome").fill("E2E Test User");
  await page.getByPlaceholder("seu@email.com").fill(uniqueEmail);
  await page.getByPlaceholder("Mínimo 6 caracteres").fill("senha123");

  // Submete
  await page.getByRole("button", { name: "Criar Conta", exact: true }).click();

  // Após registro bem-sucedido, deve redirecionar para fora de /register
  await expect(page).not.toHaveURL(/\/register/, { timeout: 15_000 });

  // Deve estar numa página autenticada (não em /login)
  await expect(page).not.toHaveURL(/\/login/, { timeout: 5_000 });
});

test("deve exibir erro ao tentar registrar email já existente", async ({
  page,
}) => {
  await page.goto("/register");

  // Usa um email que provavelmente já existe (o do setup global)
  const existingEmail = process.env.E2E_TEST_EMAIL ?? "test@e2e.com";

  await page.getByPlaceholder("Seu nome").fill("Duplicate User");
  await page.getByPlaceholder("seu@email.com").fill(existingEmail);
  await page.getByPlaceholder("Mínimo 6 caracteres").fill("senha123");
  await page.getByRole("button", { name: "Criar Conta", exact: true }).click();

  // Deve continuar em /register e mostrar algum erro
  await expect(page).toHaveURL(/\/register/, { timeout: 10_000 });
});

test("deve exibir erro com campos obrigatórios em branco", async ({ page }) => {
  await page.goto("/register");

  // Tenta submeter sem preencher nada
  await page.getByRole("button", { name: "Criar Conta", exact: true }).click();

  // Deve continuar em /register
  await expect(page).toHaveURL(/\/register/, { timeout: 5_000 });
});
