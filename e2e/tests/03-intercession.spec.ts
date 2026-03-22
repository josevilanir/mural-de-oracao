/**
 * Testes E2E: Botão de Intercessão ("Orei por você")
 *
 * Cobre:
 * - Exibição do botão nos cards de oração
 * - Clicar para marcar intercessão (estado → "Orei por você ✓")
 * - Incremento do contador de intercessões
 * - Desfazer intercessão clicando novamente
 *
 * Estratégia:
 * - beforeAll: cria um pedido de oração via UI usando contexto autenticado
 * - Os testes rodam em série para aproveitar o estado persistido no servidor
 *
 * Pré-requisito: usuário autenticado via e2e/.auth/user.json (global.setup.ts)
 */
import { test, expect } from "@playwright/test";
import { AUTH_FILE } from "../helpers";

test.describe.configure({ mode: "serial" });
const PRAYER_TITLE = `Intercessão E2E – ${Date.now()}`;

test.describe("Intercessão por Pedido de Oração", () => {
  // Cria o pedido uma vez antes de todos os testes
  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: AUTH_FILE });
    const page = await ctx.newPage();

    await page.goto("/novo-pedido");
    await page
      .getByPlaceholder("e.g., Cura para minha mãe")
      .fill(PRAYER_TITLE);
    await page.locator("select").first().selectOption({ index: 1 });
    await page
      .getByPlaceholder(
        "Conte sua necessidade em detalhes. A comunidade está aqui para orar por você."
      )
      .fill("Pedido criado pelo Playwright para testar o botão de intercessão.");
    await page.getByRole("button", { name: "Publicar Pedido" }).click();
    await page.waitForURL("**/meus-pedidos", { timeout: 15_000 });

    await ctx.close();
  });

  test("deve exibir botão 'Orei por você' nos pedidos", async ({ page }) => {
    await page.goto("/meus-pedidos");

    // Aguarda pelo menos um card com o botão
    await page.waitForSelector('button:has-text("Orei por você")', {
      timeout: 10_000,
    });

    const btn = page.getByRole("button", { name: /Orei por você/ }).first();
    await expect(btn).toBeVisible();
  });

  test("deve marcar intercessão ao clicar no botão", async ({ page }) => {
    await page.goto("/meus-pedidos");
    await page.waitForSelector('button:has-text("Orei por você")', {
      timeout: 10_000,
    });

    // Localiza o card do pedido criado no beforeAll
    const card = page.locator("div").filter({ hasText: PRAYER_TITLE }).first();
    const btn = card.getByRole("button", { name: /Orei por você/ });

    // Lê o contador antes de clicar
    const textoBefore = (await btn.textContent()) ?? "";
    const matchBefore = textoBefore.match(/\((\d+)\)/);
    const countBefore = matchBefore ? parseInt(matchBefore[1]) : 0;

    // Garante que ainda não intercedeu (estado inicial)
    await expect(btn).not.toContainText("✓");

    // Clica para interceder
    await btn.click();

    // Botão deve mostrar confirmação
    await expect(btn).toContainText("✓", { timeout: 8_000 });

    // Contador deve ter incrementado
    await expect(btn).toContainText(`(${countBefore + 1})`, {
      timeout: 8_000,
    });
  });

  test("deve desfazer intercessão ao clicar novamente", async ({ page }) => {
    await page.goto("/meus-pedidos");
    await page.waitForSelector('button:has-text("Orei por você")', {
      timeout: 10_000,
    });

    const card = page.locator("div").filter({ hasText: PRAYER_TITLE }).first();
    const btn = card.getByRole("button", { name: /Orei por você/ });

    // O estado deve estar como "prayed" (do teste anterior, persistido no servidor)
    await expect(btn).toContainText("✓", { timeout: 8_000 });

    const textoBefore = (await btn.textContent()) ?? "";
    const match = textoBefore.match(/\((\d+)\)/);
    const countBefore = match ? parseInt(match[1]) : 1;

    // Clica para desfazer
    await btn.click();

    // Botão deve voltar ao estado original (sem ✓)
    await expect(btn).not.toContainText("✓", { timeout: 8_000 });

    // Contador deve ter decrementado
    await expect(btn).toContainText(`(${countBefore - 1})`, {
      timeout: 8_000,
    });
  });
});
