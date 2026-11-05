import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

// Set E2E_EXPECT_BACKEND=connected when a backend is running (CI does this).
const expectBackend = process.env.E2E_EXPECT_BACKEND

test.describe("Home (Phase 0 skeleton)", () => {
  test("shows the brand and the backend status", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toContainText("fitgaadi")

    const badge = page.getByTestId("backend-status")
    await expect(badge).toBeVisible()
    if (expectBackend) {
      await expect(badge).toHaveAttribute("data-status", expectBackend)
    }
  })

  test("uses shared INR formatting (lakh grouping)", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByTestId("price-sample")).toHaveText("₹1,25,000")
  })

  test("has no automatically detectable accessibility violations", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByTestId("backend-status")).toBeVisible()
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test("skip link is the first thing keyboard users reach", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard navigation is checked on desktop")
    await page.goto("/")
    await page.keyboard.press("Tab")
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused()
  })
})
