import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

/** Needs the backend and the demo catalogue. Delivery answers come from the mock provider. */
const CRETA_SEAT_COVER = "/p/kavach-creta-2020-present-leatherette-seat-covers"

test.describe("Delivery check on the product page", () => {
  test("gives a date for 110001 and apologises for 000000", async ({ page }) => {
    await page.goto(CRETA_SEAT_COVER)
    const panel = page.getByRole("region", { name: "Delivery" })
    const pin = panel.getByLabel("PIN code")
    const status = panel.getByRole("status")

    await pin.fill("110001")
    await panel.getByRole("button", { name: "Check" }).click()
    await expect(status).toContainText(/Delivery to 110001 between \w{3}, \d{1,2} \w{3} and/)
    await expect(status).toContainText("Cash on delivery is available.")

    const results = await new AxeBuilder({ page })
      .include('section[aria-labelledby="delivery-title"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()
    expect(results.violations.map((v) => v.id)).toEqual([])

    await pin.fill("000000")
    await pin.press("Enter")
    await expect(status).toHaveText("Sorry, we don't deliver to 000000 yet.")
  })

  test("asks for six digits", async ({ page }) => {
    await page.goto(CRETA_SEAT_COVER)
    const panel = page.getByRole("region", { name: "Delivery" })
    await panel.getByLabel("PIN code").fill("1100")
    await panel.getByRole("button", { name: "Check" }).click()
    await expect(panel.getByText("Enter a 6-digit PIN code.")).toBeVisible()
    await expect(panel.getByLabel("PIN code")).toBeFocused()
  })

  test("remembers the PIN code on the next visit", async ({ page }) => {
    await page.goto(CRETA_SEAT_COVER)
    const panel = page.getByRole("region", { name: "Delivery" })
    await panel.getByLabel("PIN code").fill("560 034")
    await panel.getByRole("button", { name: "Check" }).click()
    await expect(panel.getByRole("status")).toContainText("Delivery to 560034")

    await page.reload()
    await expect(panel.getByLabel("PIN code")).toHaveValue("560034")
    await expect(panel.getByRole("status")).toContainText("Delivery to 560034")
  })
})
