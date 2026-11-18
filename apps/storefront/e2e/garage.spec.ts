import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

/** Needs the backend with the launch car list (CI seeds it with `pnpm db:migrate`). */

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

test.describe("My Garage", () => {
  test("pick a real car, keep it after a reload, switch and remove cars", async ({ page }) => {
    await page.goto("/garage")
    await expect(page.getByRole("heading", { name: "No cars yet" })).toBeVisible()
    expect(await axe(page)).toEqual([])

    await page.getByRole("button", { name: "Add a car" }).click()
    await pickCar(page, "Hyundai", "Creta", "2021", /SX\(O\) Turbo DCT/)
    const banner = page.getByRole("banner")
    await expect(banner.getByText("Hyundai Creta 2021 SX(O) Turbo DCT")).toBeVisible()

    // Remembered on this device.
    await page.reload()
    await expect(banner.getByText("Hyundai Creta 2021 SX(O) Turbo DCT")).toBeVisible()

    // A second car, without a variant, becomes the current one.
    await page.getByRole("button", { name: "Add another car" }).click()
    await pickCar(page, "Tata", "Nexon", "2024")
    await expect(banner.getByText("Tata Nexon 2024")).toBeVisible()
    const saved = page.getByRole("list", { name: "Saved cars" }).getByRole("listitem")
    await expect(saved).toHaveCount(2)
    expect(await axe(page)).toEqual([])

    // Switch back to the Creta, then remove it.
    await page.getByRole("button", { name: /Shop for this car: Hyundai Creta/ }).click()
    await expect(banner.getByText("Hyundai Creta 2021 SX(O) Turbo DCT")).toBeVisible()
    await page.getByRole("button", { name: /Remove Hyundai Creta/ }).click()
    await expect(saved).toHaveCount(1)
    await expect(banner.getByText("No car selected")).toBeVisible()
  })
})
