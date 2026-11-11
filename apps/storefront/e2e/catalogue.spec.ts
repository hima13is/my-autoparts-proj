import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

/** Needs the backend with the car list and the demo catalogue (CI loads both). */

async function axe(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()
  return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)
}

async function pickCar(page: Page, make: string, model: string, year: string, variant?: RegExp) {
  const sheet = page.getByRole("dialog")
  await sheet.getByRole("button", { name: make, exact: true }).click()
  await sheet.getByRole("button", { name: model, exact: true }).click()
  await sheet.getByRole("button", { name: year, exact: true }).click()
  await sheet.getByRole("button", { name: variant ?? /not sure/ }).click()
  await expect(sheet).toBeHidden()
}

const grid = (page: Page, name: RegExp) => page.getByRole("list", { name })

test.describe("Category pages", () => {
  test("filter to the shopper's car, with fit badges", async ({ page }) => {
    await page.goto("/c/seat-covers")
    await expect(page.getByRole("heading", { level: 1, name: "Seat Covers" })).toBeVisible()
    const products = grid(page, /Seat Covers products/)
    // No car yet: everything is listed and car-specific items ask to check fit.
    await expect(products.getByRole("link", { name: /Swift 2024–present/ })).toBeVisible()
    await expect(products.getByText("Check fitment").first()).toBeVisible()
    expect(await axe(page)).toEqual([])

    await page.getByRole("button", { name: "Select your car" }).first().click()
    await pickCar(page, "Hyundai", "Creta", "2021", /SX\(O\) Turbo DCT/)

    await expect(page.getByText(/Showing what fits your/)).toContainText("Hyundai Creta 2021")
    await expect(
      products.getByRole("link", { name: /Creta 2020–present leatherette/ })
    ).toBeVisible()
    await expect(products.getByRole("link", { name: /Swift/ })).toHaveCount(0)
    await expect(products.getByText("Fits Creta").first()).toBeVisible()
    await expect(products.getByText("Check fitment")).toHaveCount(0)

    // Universal products say so.
    await page.goto("/c/dashcams")
    await expect(
      grid(page, /Dashcams products/)
        .getByText("Fits all cars")
        .first()
    ).toBeVisible()
  })

  test("sort and brand filter are links that keep their state", async ({ page }) => {
    await page.goto("/c/dashcams")
    await page
      .getByRole("navigation", { name: "Sort products" })
      .getByRole("link", { name: "Price: low to high" })
      .click()
    await expect(page).toHaveURL(/sort=price-asc/)
    const sorted = page.getByRole("link", { name: "Price: low to high" })
    await expect(sorted).toHaveAttribute("aria-current", "true")

    await page
      .getByRole("navigation", { name: "Filter by brand" })
      .getByRole("link", { name: "LumaDrive" })
      .click()
    await expect(page).toHaveURL(/brand=lumadrive/)
    await expect(page).toHaveURL(/sort=price-asc/)
    await expect(page.getByRole("status").filter({ hasText: /products?$/ })).toContainText(
      /\d+ products?/
    )
  })

  test("parent category lists its sub-categories", async ({ page }) => {
    await page.goto("/c/interior")
    await expect(
      page
        .getByRole("navigation", { name: "Interior categories" })
        .getByRole("link", { name: "Seat Covers" })
    ).toBeVisible()
  })

  test("unknown category shows the not-found page", async ({ page }) => {
    // Streamed pages send their status before notFound() runs, so Next shows the
    // not-found page with a noindex tag instead of a 404 status.
    await page.goto("/c/no-such-thing")
    await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible()
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached()
  })
})

test.describe("Car pages", () => {
  test("show accessories per model year and set the car", async ({ page }) => {
    await page.goto("/cars/hyundai/creta")
    await expect(
      page.getByRole("heading", { level: 1, name: "Hyundai Creta accessories" })
    ).toBeVisible()
    expect(await axe(page)).toEqual([])

    await page
      .getByRole("navigation", { name: "Model year" })
      .getByRole("link", { name: "2017" })
      .click()
    await expect(page).toHaveURL(/year=2017/)
    const list = grid(page, /2017 Hyundai Creta/)
    // Older generation: the halogen LED kit fits; the current-generation seat covers don't.
    await expect(list.getByRole("link", { name: /LED headlight bulb kit/ }).first()).toBeVisible()
    await expect(list.getByRole("link", { name: /Creta 2020–present/ })).toHaveCount(0)

    await page.getByRole("button", { name: "Set Creta 2017 as my car" }).click()
    await expect(page.getByRole("banner").getByText("Hyundai Creta 2017")).toBeVisible()
    await expect(page.getByText("This is your car")).toBeVisible()
  })

  test("unknown car shows the not-found page", async ({ page }) => {
    // Streamed pages send their status before notFound() runs, so Next shows the
    // not-found page with a noindex tag instead of a 404 status.
    await page.goto("/cars/hyundai/no-such-model")
    await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible()
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached()
  })
})
