import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

/** Needs the backend with the car list and the demo catalogue (CI loads both). */

async function axe(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()
  return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)
}

async function pickCar(page: Page, make: string, model: string, year: string) {
  const sheet = page.getByRole("dialog")
  await sheet.getByRole("button", { name: make, exact: true }).click()
  await sheet.getByRole("button", { name: model, exact: true }).click()
  await sheet.getByRole("button", { name: year, exact: true }).click()
  await sheet.getByRole("button", { name: /not sure/ }).click()
  await expect(sheet).toBeHidden()
}

const CRETA_SEAT_COVER = "/p/kavach-creta-2020-present-leatherette-seat-covers"

const heroField = (page: Page, label: string) =>
  page.getByRole("form", { name: "Select your car" }).getByLabel(label, { exact: true })

test.describe("Home", () => {
  test("pick a car in the hero and land on its accessories", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toContainText("fit your car")
    expect(await axe(page)).toEqual([])

    await heroField(page, "Make").selectOption({ label: "Hyundai" })
    await heroField(page, "Model").selectOption({ label: "Creta" })
    await heroField(page, "Year").selectOption({ label: "2021" })
    await page.getByRole("button", { name: "Show accessories" }).click()

    await expect(page).toHaveURL(/\/cars\/hyundai\/creta\?year=2021/)
    await expect(page.getByRole("banner").getByText("Hyundai Creta 2021")).toBeVisible()

    // Back home, the hero remembers the car.
    await page.goto("/")
    await expect(page.getByRole("button", { name: "See accessories for my car" })).toBeVisible()
  })
})

test.describe("Product page", () => {
  test("says whether it fits, lists the cars it fits, and checks another car", async ({ page }) => {
    // Demo catalogue handle (deterministic: built from brand + title).
    await page.goto(CRETA_SEAT_COVER)
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Creta 2020–present")
    await expect(page.getByText("Select your car and we'll tell you if this fits.")).toBeVisible()
    const fitsList = page.getByRole("region", { name: "Cars this fits" })
    await expect(fitsList.getByRole("link", { name: "Hyundai Creta 2020–present" })).toBeVisible()
    expect(await axe(page)).toEqual([])

    await page.getByRole("button", { name: "Select your car" }).first().click()
    await pickCar(page, "Hyundai", "Creta", "2021")
    await expect(page.getByText("Yes, this fits your Hyundai Creta 2021.")).toBeVisible()

    await page.getByRole("button", { name: "Check another car" }).click()
    await pickCar(page, "Maruti Suzuki", "Swift", "2024")
    await expect(page.getByText(/No, this doesn't fit your Maruti Suzuki Swift 2024/)).toBeVisible()
    await expect(page.getByText("Doesn't fit Swift")).toBeVisible()
  })

  test("universal products fit every car", async ({ page }) => {
    await page.goto("/c/dashcams")
    await page
      .getByRole("list", { name: /Dashcams products/ })
      .getByRole("link")
      .first()
      .click()
    await expect(page.getByText("Every car. This is a universal accessory.")).toBeVisible()
    await expect(page.getByText("Fits all cars").first()).toBeVisible()
  })

  test("colour choice changes the price shown", async ({ page }) => {
    // Demo catalogue handle (deterministic: built from brand + title).
    await page.goto(CRETA_SEAT_COVER)
    const colours = page.getByRole("group", { name: "Colour" })
    await expect(colours).toBeVisible()
    const price = page
      .locator("main")
      .getByText(/^Price\s*₹/)
      .first()
    const before = await price.textContent()
    await colours.getByLabel("Black & Beige").check()
    await expect(price).not.toHaveText(before ?? "")
  })
})

test.describe("Not found", () => {
  test("unknown URLs get the branded 404 with a real 404 status", async ({ page }) => {
    const res = await page.goto("/no-such-page")
    expect(res?.status()).toBe(404)
    await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Go to the home page" })).toBeVisible()
    expect(await axe(page)).toEqual([])
  })
})
