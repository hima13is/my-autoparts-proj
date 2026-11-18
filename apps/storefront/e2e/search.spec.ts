import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

/** Needs the backend with the demo catalogue indexed for search (CI does both). */

const results = (page: Page) => page.getByRole("list", { name: /Search results for/ })

async function searchFor(page: Page, q: string) {
  const box = page.getByRole("banner").getByRole("combobox", { name: "Search accessories" })
  await box.fill(q)
  await box.press("Enter")
  // Wait for this exact query (the previous search's URL also starts with /search?q=).
  await page.waitForURL((url) => url.pathname === "/search" && url.searchParams.get("q") === q)
}

test.describe("Search", () => {
  test("finds dashcams however you spell it (PLAN manual step 4)", async ({ page }) => {
    await page.goto("/")
    for (const q of ["dashcam", "dash cam", "dascam"]) {
      await searchFor(page, q)
      await expect(page.getByRole("heading", { level: 1 })).toContainText(q)
      await expect(
        results(page).getByRole("link", { name: /Dashcam 2K front \+ rear/ })
      ).toBeVisible()
    }
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations
    ).toEqual([])
  })

  test("'seet cvr' finds seat covers", async ({ page }) => {
    await page.goto("/search?q=seet%20cvr")
    await expect(
      results(page)
        .getByRole("link", { name: /leatherette seat covers/ })
        .first()
    ).toBeVisible()
  })

  test("with a car, only shows what fits it; 'search all' lifts the filter", async ({ page }) => {
    await page.goto("/search?q=seat%20covers")
    await expect(results(page).getByRole("link", { name: /Swift 2024–present/ })).toBeVisible()

    const sheet = page.getByRole("dialog")
    // Retry the click until the page has hydrated and the selector opens.
    await expect(async () => {
      await page.getByRole("button", { name: "Select your car" }).first().click()
      await expect(sheet).toBeVisible({ timeout: 1000 })
    }).toPass()
    for (const step of ["Hyundai", "Creta", "2021"]) {
      await sheet.getByRole("button", { name: step, exact: true }).click()
    }
    await sheet.getByRole("button", { name: /not sure/ }).click()

    await expect(page.getByText(/Showing what fits your/)).toContainText("Hyundai Creta 2021")
    await expect(
      results(page).getByRole("link", { name: /Creta 2020–present leatherette/ })
    ).toBeVisible()
    await expect(results(page).getByRole("link", { name: /Swift/ })).toHaveCount(0)

    await page.getByRole("link", { name: "Search all products" }).click()
    await expect(results(page).getByRole("link", { name: /Swift 2024–present/ })).toBeVisible()
  })

  test("no results offers categories", async ({ page }) => {
    await page.goto("/search?q=zzqxv")
    await expect(page.getByRole("heading", { name: /Nothing found/ })).toBeVisible()
    await expect(
      page.getByRole("main").getByRole("link", { name: "Seat Covers", exact: true })
    ).toBeVisible()
  })

  test("suggestions appear as you type and work with the keyboard", async ({ page }) => {
    await page.goto("/")
    const box = page.getByRole("banner").getByRole("combobox", { name: "Search accessories" })
    await box.pressSequentially("dascam", { delay: 30 })
    const list = page.getByRole("listbox", { name: "Search suggestions" })
    await expect(list.getByRole("option", { name: /Dashcam/ }).first()).toBeVisible()
    await expect(list.getByRole("option", { name: /See all results for “dascam”/ })).toBeVisible()

    await box.press("ArrowDown")
    await expect(list.getByRole("option").first()).toHaveAttribute("aria-selected", "true")
    await box.press("Enter")
    await expect(page).toHaveURL(/\/p\/.*dashcam/)
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/dashcam/i)
  })
})
