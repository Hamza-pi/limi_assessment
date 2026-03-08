/**
 * tests/configurator.spec.ts
 *
 * E2E tests for the Configurator slide-over panel (ConfiguratorSheet).
 * The panel opens when the user clicks any module node on the floor plan.
 * Tests cover: opening, form editing, and client-side Zod validation errors.
 */

import { test, expect, type Page } from "@playwright/test";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Navigate and wait until modules are visible on the floor plan.  */
async function loadPage(page: Page) {
  await page.goto("/");
  await page.getByRole("application").waitFor({ state: "visible" });
  await page
    .locator('[data-testid="module-node"]')
    .first()
    .waitFor({ state: "visible", timeout: 15_000 });
}

/** Open the configurator by clicking the first module node and wait for the panel. */
async function openConfigurator(page: Page) {
  const firstModule = page.locator('[data-testid="module-node"]').first();
  await firstModule.click();

  const panel = page.locator('[data-testid="configurator-panel"]');
  await expect(panel).toBeVisible({ timeout: 5_000 });
  return panel;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe("Configurator panel", () => {
  test("opens when a module is clicked", async ({ page }) => {
    await loadPage(page);

    // Panel must not be visible before any interaction
    await expect(
      page.locator('[data-testid="configurator-panel"]'),
    ).not.toBeVisible();

    // Click the first module
    const panel = await openConfigurator(page);

    // The panel should be visible and contain the form
    await expect(panel).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
  });

  test("editing name and saving updates the module label on the floor plan", async ({
    page,
  }) => {
    await loadPage(page);

    // Grab the first module's current aria-label before editing
    const firstModule = page.locator('[data-testid="module-node"]').first();
    const originalLabel = await firstModule.getAttribute("aria-label");
    expect(originalLabel).toBeTruthy();

    await openConfigurator(page);

    // Update the name
    const nameInput = page.getByLabel("Name");
    await nameInput.clear();
    await nameInput.fill("Updated Module Name");

    // Submit the form
    await page.getByTestId("save-changes-btn").click();

    // Panel should close after a successful save
    await expect(
      page.locator('[data-testid="configurator-panel"]'),
    ).not.toBeVisible({ timeout: 5_000 });

    // The module's aria-label should now include the new name
    await expect(
      page.locator('[data-testid="module-node"]').filter({
        has: page.locator('[aria-label*="Updated Module Name"]').first(),
      }),
    ).toBeVisible();
  });

  test("shows a validation error for an invalid UUID", async ({ page }) => {
    await loadPage(page);
    await openConfigurator(page);

    // Enter an invalid UUID (not a valid MAC address)
    const uuidInput = page.getByLabel("UUID (Hardware MAC)");
    await uuidInput.clear();
    await uuidInput.fill("NOT-A-VALID-UUID");

    // Attempt to submit
    await page.getByTestId("save-changes-btn").click();

    // A validation error message should appear (Zod schema rule)
    await expect(
      page.getByText(/UUID must follow the hardware format/i),
    ).toBeVisible({ timeout: 3_000 });

    // Panel must stay open (form was not submitted)
    await expect(
      page.locator('[data-testid="configurator-panel"]'),
    ).toBeVisible();
  });

  test("shows a validation error for a non-positive power limit", async ({
    page,
  }) => {
    await loadPage(page);
    await openConfigurator(page);

    // Enter a negative value (violates z.number().positive())
    const powerInput = page.getByLabel("Power Limit (W)");
    await powerInput.clear();
    await powerInput.fill("-5");

    // Attempt to submit
    await page.getByTestId("save-changes-btn").click();

    // A validation error message should appear (Zod schema rule)
    await expect(
      page.getByText(/Power limit must be greater than zero/i),
    ).toBeVisible({ timeout: 3_000 });

    // Panel must stay open (form was not submitted)
    await expect(
      page.locator('[data-testid="configurator-panel"]'),
    ).toBeVisible();
  });
});
