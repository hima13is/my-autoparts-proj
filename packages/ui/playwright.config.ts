import { defineConfig, devices } from "@playwright/test"

// Screenshot test of every Storybook story (visual regression). Build Storybook first
// (`pnpm build:storybook`). Baselines are Linux-only: run inside the Playwright Docker
// image (CI job "visual", or scripts/visual-baselines.sh to update them).
const PORT = 6008

export default defineConfig({
  testDir: "./e2e",
  testMatch: /\.visual\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled" } },
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices["Desktop Chrome"],
    viewport: { width: 1024, height: 768 },
  },
  webServer: {
    command: `node e2e/serve.mjs`,
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/index.json`,
    reuseExistingServer: !process.env.CI,
  },
})
