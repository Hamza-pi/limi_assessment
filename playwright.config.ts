import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. */
  reporter: "html",

  use: {
    /** All tests use localhost:3000 — no need to repeat the base URL. */
    baseURL: "http://localhost:3000",
    /** Capture a trace on the first retry of each failing test. */
    trace: "on-first-retry",
    /** Give real-world UI interactions a generous timeout. */
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],

  /**
   * Start the Next.js dev server before running tests.
   * `reuseExistingServer` lets developers keep a running `bun dev` session
   * so Playwright doesn't restart the server on every test run.
   */
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
