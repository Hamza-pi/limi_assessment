/**
 * tests/toggle-all.spec.ts
 *
 * E2E tests for the "Toggle All Lights" master switch in MasterControls.
 * The switch carries `data-testid="toggle-all-switch"` and each individual
 * light toggle carries `data-testid="light-switch"`.
 *
 * Each test starts from a clean page load so state is consistent.
 */

import { test, expect, type Page } from "@playwright/test";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Navigate to the app and wait until the Zustand store has hydrated. */
async function loadPage(page: Page) {
  await page.goto("/");

  // Floor plan becomes visible once StoreInitializer has run
  await page.getByRole("application").waitFor({ state: "visible" });

  // At least one module node must be mounted (proves hydration completed)
  await page
    .locator('[data-testid="module-node"]')
    .first()
    .waitFor({ state: "visible", timeout: 15_000 });
}

/**
 * Returns the current aria-checked value of a locator as a boolean.
 * shadcn Switch renders `aria-checked="true"` / `aria-checked="false"`.
 */
async function isChecked(locator: ReturnType<Page["locator"]>) {
  return (await locator.getAttribute("aria-checked")) === "true";
}

/** Ensure the master toggle is in the requested state, clicking if needed. */
async function ensureMasterState(page: Page, targetOn: boolean) {
  const toggle = page.getByTestId("toggle-all-switch");
  const currentlyOn = await isChecked(toggle);
  if (currentlyOn !== targetOn) {
    await toggle.click();
    // Wait for the optimistic Zustand update to propagate to the DOM
    await page.waitForTimeout(400);
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe("Toggle All Lights master switch", () => {
  test("switches all lights OFF when master is turned off", async ({
    page,
  }) => {
    await loadPage(page);

    const masterToggle = page.getByTestId("toggle-all-switch");
    const lightSwitches = page.locator('[data-testid="light-switch"]');

    // Start from a known ON state
    await ensureMasterState(page, true);
    await expect(masterToggle).toHaveAttribute("aria-checked", "true");

    // Turn everything OFF via the master switch
    await masterToggle.click();
    await page.waitForTimeout(400);

    await expect(masterToggle).toHaveAttribute("aria-checked", "false");

    // Every individual light switch must report OFF
    const lightCount = await lightSwitches.count();
    expect(lightCount).toBeGreaterThan(0);

    for (let i = 0; i < lightCount; i++) {
      await expect(lightSwitches.nth(i)).toHaveAttribute(
        "aria-checked",
        "false",
      );
    }

    // Non-light modules must NOT have gained a light switch (unchanged count)
    const allSwitches = page.locator('[data-testid="light-switch"]');
    await expect(allSwitches).toHaveCount(lightCount);
  });

  test("switches all lights back ON when master is turned on", async ({
    page,
  }) => {
    await loadPage(page);

    const masterToggle = page.getByTestId("toggle-all-switch");
    const lightSwitches = page.locator('[data-testid="light-switch"]');

    // Start from a known OFF state
    await ensureMasterState(page, false);
    await expect(masterToggle).toHaveAttribute("aria-checked", "false");

    // Turn everything ON via the master switch
    await masterToggle.click();
    await page.waitForTimeout(400);

    await expect(masterToggle).toHaveAttribute("aria-checked", "true");

    // Every individual light switch must report ON
    const lightCount = await lightSwitches.count();
    expect(lightCount).toBeGreaterThan(0);

    for (let i = 0; i < lightCount; i++) {
      await expect(lightSwitches.nth(i)).toHaveAttribute(
        "aria-checked",
        "true",
      );
    }
  });

  test("individual toggle only changes that single light", async ({ page }) => {
    await loadPage(page);

    const lightSwitches = page.locator('[data-testid="light-switch"]');
    const lightCount = await lightSwitches.count();

    // Need at least two lights to verify isolation
    expect(lightCount).toBeGreaterThanOrEqual(2);

    // Start from a known ON state so checking OFF is meaningful
    await ensureMasterState(page, true);
    await page.waitForTimeout(200);

    const targetSwitch = lightSwitches.first();
    const otherSwitch = lightSwitches.nth(1);

    const targetBefore = await isChecked(targetSwitch);
    const otherBefore = await isChecked(otherSwitch);

    // Toggle only the first light
    await targetSwitch.click();
    await page.waitForTimeout(400);

    // Target light must have flipped
    const targetAfter = await isChecked(targetSwitch);
    expect(targetAfter).toBe(!targetBefore);

    // Second light must be unchanged
    const otherAfter = await isChecked(otherSwitch);
    expect(otherAfter).toBe(otherBefore);
  });
});
