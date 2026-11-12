import { expect, test, type Page } from "@playwright/test"

/** SEO basics (PLAN Phase 2, task 7). Needs the backend and the demo catalogue. */
const CRETA_SEAT_COVER = "/p/kavach-creta-2020-present-leatherette-seat-covers"
const PAGES = ["/", "/c/seat-covers", "/cars/hyundai/creta", CRETA_SEAT_COVER]

// Metadata is the same on every device, so one project is enough.
test.skip(({ isMobile }) => isMobile, "metadata doesn't depend on the device")

async function jsonLd(page: Page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.map((text) => JSON.parse(text) as Record<string, unknown>)
}

for (const path of PAGES) {
  test(`${path} has a title, description and absolute canonical`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveTitle(/FitGaadi/)
    const description = await page.locator('meta[name="description"]').getAttribute("content")
    expect(description?.length).toBeGreaterThan(20)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href")
    expect(canonical).toMatch(/^https?:\/\//)
    expect(new URL(canonical!).pathname).toBe(path)
  })
}

test("the product page has Product and BreadcrumbList JSON-LD", async ({ page }) => {
  await page.goto(CRETA_SEAT_COVER)
  const data = await jsonLd(page)
  const product = data.find((d) => d["@type"] === "Product")
  expect(product).toMatchObject({
    "@context": "https://schema.org",
    name: expect.stringContaining("seat covers"),
    brand: { "@type": "Brand", name: "Kavach" },
    offers: { priceCurrency: "INR", availability: "https://schema.org/InStock" },
  })
  const offers = product!.offers as { price?: number; lowPrice?: number }
  expect(offers.price ?? offers.lowPrice).toBeGreaterThan(0)

  const crumbs = data.find((d) => d["@type"] === "BreadcrumbList")
  const items = crumbs!.itemListElement as { position: number; name: string; item: string }[]
  expect(items.map((i) => i.position)).toEqual(items.map((_, i) => i + 1))
  expect(items[0].name).toBe("Home")
  expect(new URL(items.at(-1)!.item).pathname).toBe(CRETA_SEAT_COVER)
})

test("the category page has BreadcrumbList JSON-LD", async ({ page }) => {
  await page.goto("/c/seat-covers")
  const crumbs = (await jsonLd(page)).find((d) => d["@type"] === "BreadcrumbList")
  expect(crumbs).toBeTruthy()
})

test("robots.txt keeps the demo site out of search engines", async ({ request }) => {
  const res = await request.get("/robots.txt")
  expect(res.ok()).toBe(true)
  // ALLOW_INDEXING is not set outside production.
  expect(await res.text()).toMatch(/Disallow: \/\s*$/m)
})

test("sitemap.xml lists categories, car pages and products", async ({ request }) => {
  const res = await request.get("/sitemap.xml")
  expect(res.ok()).toBe(true)
  const xml = await res.text()
  for (const path of ["/c/seat-covers", "/cars/hyundai/creta", CRETA_SEAT_COVER]) {
    expect(xml).toContain(`${path}</loc>`)
  }
  expect(xml).not.toContain("/search")
  expect(xml).not.toContain("/garage")
})
