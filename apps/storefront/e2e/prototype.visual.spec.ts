import { expect, test } from "@playwright/test"

// Responsive screenshots of the prototype (Build Phase 1). Run with VISUAL=1 inside
// the Playwright Docker image; update baselines with scripts/visual-baselines.sh.
const widths = [360, 390, 768, 1024, 1440]
const pages = [
  ["home", "/prototype"],
  ["category", "/prototype/c/seat-covers"],
  ["product", "/prototype/p/leatherette-seat-cover-black"],
  ["cart-empty", "/prototype/cart"],
] as const

for (const width of widths) {
  for (const [name, url] of pages) {
    test(`${name} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(url)
      await page.evaluate(() => document.fonts.ready)
      await expect(page).toHaveScreenshot(`${name}-${width}.png`, { fullPage: true })
    })
  }
}
