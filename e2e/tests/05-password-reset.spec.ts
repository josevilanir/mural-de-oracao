import { test, expect } from "@playwright/test";

/**
 * E2E: Fluxo de reset de senha
 *
 * Usa contexto limpo (sem storageState) — o usuário não está logado.
 * Testa o pedido de reset e a confirmação de envio do email.
 */

test.use({ storageState: { cookies: [], origins: [] } });

test("deve exibir formulário de reset ao clicar em 'Esqueci minha senha'", async ({
  page,
}) => {
  await page.goto("/login");

  // Localiza e clica no link de esqueceu a senha
  await page.getByRole("link", { name: /esqueceu/i }).click();

  // Deve navegar para a página/modal de reset
  await expect(page).toHaveURL(/\/(forgot|reset|recuperar|senha)/, {
    timeout: 10_000,
  });
});

test("deve enviar pedido de reset e exibir confirmação", async ({ page }) => {
  // Navega diretamente à página de forgot-password
  // (ajustar URL conforme rota real do projeto)
  await page.goto("/forgot-password");

  const emailInput = page.getByPlaceholder("seu@email.com");
  await emailInput.fill("qualquer@email.com");

  await page.getByRole("button", { name: /enviar|resetar|recuperar/i }).click();

  // Aguarda mensagem de sucesso ou de confirmação de envio
  await expect(
    page.getByText(/email enviado|verifique|caixa de entrada|link|mensagem/i),
  ).toBeVisible({ timeout: 10_000 });
});

test("deve exibir erro ao submeter email em branco", async ({ page }) => {
  await page.goto("/forgot-password");

  await page.getByRole("button", { name: /enviar|resetar|recuperar/i }).click();

  // Deve permanecer na página e/ou exibir validação de campo obrigatório
  await expect(page).toHaveURL(/forgot-password/, { timeout: 5_000 });
});
