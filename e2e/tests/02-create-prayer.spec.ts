/**
 * Testes E2E: Criação de Pedido de Oração
 *
 * Cobre:
 * - Acesso à página /novo-pedido (requer autenticação)
 * - Criação de um pedido com campos obrigatórios preenchidos
 * - Redirecionamento para /meus-pedidos após criação
 * - Validação de campos obrigatórios vazios
 *
 * Pré-requisito: usuário autenticado via e2e/.auth/user.json (global.setup.ts)
 */
import { test, expect } from "@playwright/test";

test.describe("Criação de Pedido de Oração", () => {
  test("deve exibir o formulário de novo pedido", async ({ page }) => {
    await page.goto("/novo-pedido");

    await expect(
      page.getByPlaceholder("e.g., Cura para minha mãe")
    ).toBeVisible();
    await expect(page.locator("select").first()).toBeVisible();
    await expect(
      page.getByPlaceholder(
        "Conte sua necessidade em detalhes. A comunidade está aqui para orar por você."
      )
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Publicar Pedido" })
    ).toBeVisible();
  });

  test("deve mostrar erros de validação ao enviar formulário vazio", async ({
    page,
  }) => {
    await page.goto("/novo-pedido");

    await page.getByRole("button", { name: "Publicar Pedido" }).click();

    // react-hook-form exibe erros inline para campos obrigatórios
    await expect(page.locator(".text-red-500").first()).toBeVisible({
      timeout: 5_000,
    });

    // Deve permanecer na mesma página
    await expect(page).toHaveURL(/\/novo-pedido/);
  });

  test("deve criar um pedido de oração com sucesso", async ({ page }) => {
    const titulo = `Pedido E2E – ${Date.now()}`;

    await page.goto("/novo-pedido");

    // Título
    await page
      .getByPlaceholder("e.g., Cura para minha mãe")
      .fill(titulo);

    // Categoria (primeiro option não-vazio)
    await page.locator("select").first().selectOption({ index: 1 });

    // Descrição
    await page
      .getByPlaceholder(
        "Conte sua necessidade em detalhes. A comunidade está aqui para orar por você."
      )
      .fill(
        "Este é um pedido criado automaticamente pelo Playwright para validar o fluxo de criação. Por favor, ore conosco."
      );

    // Submete
    await page.getByRole("button", { name: "Publicar Pedido" }).click();

    // Deve redirecionar para /meus-pedidos
    await page.waitForURL("**/meus-pedidos", { timeout: 15_000 });
    await expect(page).toHaveURL(/\/meus-pedidos/);

    // O pedido criado deve aparecer na lista
    await expect(page.getByText(titulo)).toBeVisible({ timeout: 10_000 });
  });

  test("deve cancelar e voltar à página anterior", async ({ page }) => {
    // Navega para o feed antes de ir ao formulário
    await page.goto("/");
    await page.goto("/novo-pedido");

    await page.getByRole("button", { name: "Cancelar" }).click();

    // Deve ter voltado (o botão chama router.back())
    await expect(page).not.toHaveURL(/\/novo-pedido/);
  });
});
