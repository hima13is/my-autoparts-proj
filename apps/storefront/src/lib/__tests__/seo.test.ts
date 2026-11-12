import { describe, expect, it } from "vitest"
import {
  breadcrumbJsonLd,
  indexingAllowed,
  productJsonLd,
  serializeJsonLd,
  siteUrl,
  sitemapPaths,
} from "../seo"

const BASE = "https://fitgaadi.example"

describe("siteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL, without a trailing slash", () => {
    expect(
      siteUrl({
        NEXT_PUBLIC_SITE_URL: "https://fitgaadi.in/",
        VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app",
      })
    ).toBe("https://fitgaadi.in")
  })
  it("falls back to the Vercel production URL, then localhost", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "fg.vercel.app" })).toBe(
      "https://fg.vercel.app"
    )
    expect(siteUrl({})).toBe("http://localhost:3000")
  })
})

describe("indexingAllowed", () => {
  it("is off unless ALLOW_INDEXING is exactly true", () => {
    expect(indexingAllowed({})).toBe(false)
    expect(indexingAllowed({ ALLOW_INDEXING: "1" })).toBe(false)
    expect(indexingAllowed({ ALLOW_INDEXING: "true" })).toBe(true)
  })
})

describe("breadcrumbJsonLd", () => {
  it("numbers the crumbs and gives the last one the page URL", () => {
    const data = breadcrumbJsonLd(
      [
        { label: "Home", href: "/" },
        { label: "Seat covers", href: "/c/seat-covers" },
        { label: "Kavach" },
      ],
      "/p/kavach",
      BASE
    )
    expect(data.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Seat covers", item: `${BASE}/c/seat-covers` },
      { "@type": "ListItem", position: 3, name: "Kavach", item: `${BASE}/p/kavach` },
    ])
  })
})

describe("productJsonLd", () => {
  const base = {
    title: "Seat covers",
    handle: "seat-covers",
    description: "Leatherette",
    brand: "Kavach",
  }

  it("gives one Offer in rupees when every variant costs the same", () => {
    const data = productJsonLd({ ...base, image: "/img.jpg", prices: [1399, 1399] }, BASE)
    expect(data).toMatchObject({
      "@type": "Product",
      name: "Seat covers",
      url: `${BASE}/p/seat-covers`,
      image: `${BASE}/img.jpg`,
      brand: { "@type": "Brand", name: "Kavach" },
      offers: { "@type": "Offer", priceCurrency: "INR", price: 1399 },
    })
  })
  it("gives an AggregateOffer when prices differ", () => {
    const data = productJsonLd({ ...base, image: "/img.jpg", prices: [1799, 1399] }, BASE)
    expect(data.offers).toMatchObject({
      "@type": "AggregateOffer",
      lowPrice: 1399,
      highPrice: 1799,
      offerCount: 2,
    })
  })
  it("leaves out placeholder data-URI images and empty fields", () => {
    const data = productJsonLd(
      { title: "Mat", handle: "mat", description: null, image: "data:image/svg+xml,…", prices: [] },
      BASE
    )
    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Mat",
      url: `${BASE}/p/mat`,
    })
  })
})

describe("serializeJsonLd", () => {
  it("escapes < so text can't close the script tag", () => {
    const json = serializeJsonLd({ name: "</script><b>" })
    expect(json).not.toContain("<")
    expect(JSON.parse(json)).toEqual({ name: "</script><b>" })
  })
})

describe("sitemapPaths", () => {
  it("lists home, categories, car pages and products", () => {
    expect(
      sitemapPaths({
        categories: [{ handle: "seat-covers" }],
        cars: [{ make: "hyundai", model: "creta" }],
        products: [{ handle: "kavach" }],
      })
    ).toEqual(["/", "/c/seat-covers", "/cars/hyundai/creta", "/p/kavach"])
  })
})
