import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

const pages = [
  ["home", "/prototype"],
  ["category", "/prototype/c/seat-covers"],
  ["product", "/prototype/p/leatherette-seat-cover-black"],
  ["cart", "/prototype/cart"],
] as const

/** The home hero's car form (the selector sheet also has "make" inputs). */
const heroField = (page: Page, label: string) =>
  page.getByRole("form", { name: "Select your car" }).getByLabel(label, { exact: true })

async function axe(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()
  return results.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`
  )
}

test.describe("Prototype (Build Phase 1)", () => {
  for (const [name, url] of pages) {
    test(`${name} page has no accessibility violations`, async ({ page }) => {
      await page.goto(url)
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible()
      expect(await axe(page)).toEqual([])
    })
  }

  test("is hidden from search engines", async ({ page }) => {
    await page.goto("/prototype")
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/)
  })

  test("choosing a car turns badges into a fit promise and persists", async ({ page }) => {
    await page.goto("/prototype")
    await expect(page.getByText("Check fitment").first()).toBeVisible()

    await heroField(page, "Make").selectOption("hyundai")
    await heroField(page, "Model").selectOption("creta")
    await heroField(page, "Year").selectOption("2021")
    await heroField(page, "Variant").selectOption("sx-diesel")
    await page.getByRole("button", { name: "Show accessories" }).click()

    await expect(page).toHaveURL(/\/prototype\/c\/seat-covers$/)
    await expect(page.getByRole("banner").getByText("Hyundai Creta 2021 SX Diesel")).toBeVisible()
    await expect(page.getByText("Fits Creta").first()).toBeVisible()

    await page.reload()
    await expect(page.getByRole("banner").getByText("Hyundai Creta 2021 SX Diesel")).toBeVisible()
  })

  test("step-by-step selector sheet works with search", async ({ page }) => {
    await page.goto("/prototype/c/dashcams")
    await page.getByRole("button", { name: "Select car" }).click()
    const sheet = page.getByRole("dialog")
    await sheet.getByLabel("Search makes").fill("tat")
    await sheet.getByRole("button", { name: "Tata" }).click()
    await sheet.getByRole("button", { name: "Nexon" }).click()
    await sheet.getByRole("button", { name: "2023" }).click()
    await sheet.getByRole("button", { name: /not sure/ }).click()
    await expect(sheet).toBeHidden()
    await expect(page.getByRole("banner").getByText("Tata Nexon 2023")).toBeVisible()
  })

  test("add to cart updates the header and the cart page", async ({ page }) => {
    await page.goto("/prototype/p/7d-floor-mats")
    // Phones use the sticky bar; desktop the button in the buy box. Both say "Add to cart".
    await page.getByRole("button", { name: "Add to cart" }).locator("visible=true").first().click()
    await expect(page.getByRole("status")).toContainText("Added to cart")
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible()

    await page.goto("/prototype/cart")
    await expect(page.getByRole("link", { name: /7D Luxury Floor Mats/ })).toBeVisible()
    await expect(page.getByText("₹2,799").last()).toBeVisible()
    await page.getByRole("button", { name: /Remove/ }).click()
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible()
  })

  test("PIN code check validates and shows a delivery date", async ({ page }) => {
    await page.goto("/prototype/p/leatherette-seat-cover-black")
    const pin = page.getByLabel("Deliver to PIN code")
    await pin.fill("1234")
    await page.getByRole("button", { name: "Check" }).click()
    await expect(page.getByText("Enter a valid 6-digit PIN code.")).toBeVisible()
    await pin.fill("560034")
    await page.getByRole("button", { name: "Check" }).click()
    await expect(page.getByText(/Get it by Thu, 12 Nov · Cash on delivery available/)).toBeVisible()
  })

  test("keyboard only: home → car → category → product → add to cart", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "keyboard navigation is checked on desktop")
    await page.goto("/prototype")

    // Focus the Make select by tabbing (proves it's reachable), then choose with the keyboard.
    const make = heroField(page, "Make")
    for (let i = 0; i < 25 && !(await make.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab")
    }
    await expect(make).toBeFocused()
    await make.selectOption("hyundai")
    await page.keyboard.press("Tab")
    await heroField(page, "Model").selectOption("creta")
    await page.keyboard.press("Tab")
    await heroField(page, "Year").selectOption("2022")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await expect(page.getByRole("button", { name: "Show accessories" })).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/\/prototype\/c\/seat-covers$/)

    // Tab to the first product link and open it.
    const first = page.getByRole("link", { name: /Leatherette Seat Covers/ })
    for (let i = 0; i < 40 && !(await first.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab")
    }
    await expect(first).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Leatherette Seat Covers")

    const add = page.getByRole("button", { name: "Add to cart" }).locator("visible=true").first()
    await add.focus()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible()
  })

  test("sheet closes on Esc and returns focus (keyboard)", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard navigation is checked on desktop")
    await page.goto("/prototype/c/seat-covers")
    const trigger = page.getByRole("button", { name: /Filters/ })
    await trigger.focus()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test("every control is a big enough tap target (44px)", async ({ page, isMobile }) => {
    test.skip(!isMobile, "tap targets matter on phones")
    for (const [, url] of pages) {
      await page.goto(url)
      const small = await page.evaluate(() =>
        [
          ...document.querySelectorAll<HTMLElement>(
            "main button, main a, main select, main input, header button, header a"
          ),
        ]
          .filter((el) => el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden")
          .filter((el) => !el.closest("[aria-hidden=true]"))
          .filter((el) => {
            const r = el.getBoundingClientRect()
            // Inline text links inside sentences are exempt (WCAG 2.5.8); controls must be ≥ 44px tall.
            const inline = el.tagName === "A" && getComputedStyle(el).display === "inline"
            return (
              !inline &&
              r.height < 44 &&
              !(el instanceof HTMLInputElement && ["checkbox", "radio"].includes(el.type))
            )
          })
          .map(
            (el) =>
              `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().height)}px`
          )
      )
      expect(small, url).toEqual([])
    }
  })
})
