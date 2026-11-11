import { defineConfig, devices } from "@playwright/test"
import { E2E_SENTRY_CHECK_TOKEN } from "./e2e/constants"

// E2E_PORT lets tests run while `pnpm dev` is using 3000 (otherwise Playwright reuses the dev server).
const PORT = Number(process.env.E2E_PORT ?? 3000)
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "on-first-retry", screenshot: "only-on-failure" },
  // Screenshot comparisons only run with VISUAL=1, inside the Playwright Linux Docker
  // image (CI job "visual" and scripts/visual-baselines.sh) so pixels match exactly.
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled" } },
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  projects: process.env.VISUAL
    ? [{ name: "visual", testMatch: /\.visual\.spec\.ts$/, use: { ...devices["Desktop Chrome"] } }]
    : [
        {
          name: "mobile-chrome",
          testIgnore: /\.visual\.spec\.ts$/,
          use: { ...devices["Pixel 7"] },
        },
        {
          name: "mobile-safari",
          testIgnore: /\.visual\.spec\.ts$/,
          use: { ...devices["iPhone 14"] },
        },
        {
          name: "desktop-chrome",
          testIgnore: /\.visual\.spec\.ts$/,
          use: { ...devices["Desktop Chrome"] },
        },
      ],
  // Start the built storefront, unless testing an already-deployed URL (e.g. staging).
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm exec next start --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        // Enables /api/sentry-check for the e2e test. No DSN is set, so nothing is sent to Sentry.
        env: { SENTRY_CHECK_TOKEN: E2E_SENTRY_CHECK_TOKEN },
      },
})
