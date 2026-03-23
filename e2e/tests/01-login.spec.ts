/**
 * Testes E2E: Fluxo de Login
 *
 * Cobre:
 * - Renderização da página de login
 * - Mensagem de erro com credenciais inválidas
 * - Login bem-sucedido com credenciais válidas
 *
 * Nota: este spec roda SEM estado de auth para testar o fluxo real de login.
 */
import { test, expect } from "@playwright/test";
import { TEST_USER } from "../helpers";

// Ignora o storageState do projeto — cada teste começa deslogado
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Fluxo de Login", () => {
  test("deve exibir a página de login corretamente", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
    await expect(page.getByPlaceholder("seu@email.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Entrar", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Criar conta" })).toBeVisible();
  });

  test("deve mostrar erro com credenciais inválidas", async ({ page }) => {
    await page.goto("/login");

    await page
      .getByPlaceholder("seu@email.com")
      .fill("usuario.invalido@example.com");
    await page.getByPlaceholder("••••••••").fill("senhaerrada123");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible({
      timeout: 10_000,
    });

    // Deve permanecer na página de login
    await expect(page).toHaveURL(/\/login/);
  });

  test("deve fazer login com credenciais válidas e redirecionar", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByPlaceholder("seu@email.com").fill(TEST_USER.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    // Após login bem-sucedido deve sair da página de login
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 15_000,
    });

    await expect(page).not.toHaveURL(/\/login/);
  });
});
