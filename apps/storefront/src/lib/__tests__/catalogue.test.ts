import { describe, expect, it } from "vitest"
import { listingHref } from "../../components/listing-controls"
import { decodeCarCookie, encodeCarCookie } from "../car-cookie"
import {
  arrangeProducts,
  parseSort,
  PER_PAGE,
  toCardProduct,
  type CardProduct,
  type StoreProduct,
} from "../catalogue"

const variant = (price: number | null, mrp?: number) => ({
  id: `v${price}`,
  title: "x",
  metadata: mrp ? { mrp } : null,
  calculated_price: price === null ? null : { calculated_amount: price },
})

const store = (variants: StoreProduct["variants"]): StoreProduct => ({
  id: "p1",
  title: "Seat cover",
  handle: "seat-cover",
  thumbnail: null,
  brand: { name: "Kavach", handle: "kavach" },
  categories: [{ handle: "seat-covers" }],
  variants,
})

describe("toCardProduct", () => {
  it("uses the cheapest priced variant and its MRP", () => {
    const card = toCardProduct(store([variant(5999, 8499), variant(5499, 7999), variant(null)]))
    expect(card).toMatchObject({
      price: 5499,
      mrp: 7999,
      brand: "Kavach",
      categoryHandle: "seat-covers",
    })
  })

  it("drops an MRP that isn't above the price", () => {
    expect(toCardProduct(store([variant(999, 999)])).mrp).toBeUndefined()
  })
})

const card = (id: string, price: number, brandHandle: string): CardProduct => ({
  id,
  handle: id,
  title: id,
  brand: brandHandle.toUpperCase(),
  brandHandle,
  thumbnail: null,
  price,
})

describe("arrangeProducts", () => {
  const items = [card("a", 300, "k"), card("b", 100, "u"), card("c", 200, "k")]

  it("keeps the incoming order for 'featured' and sorts by price", () => {
    expect(arrangeProducts(items, {}).items.map((p) => p.id)).toEqual(["a", "b", "c"])
    expect(arrangeProducts(items, { sort: "price-asc" }).items.map((p) => p.id)).toEqual([
      "b",
      "c",
      "a",
    ])
    expect(arrangeProducts(items, { sort: "price-desc" }).items.map((p) => p.id)).toEqual([
      "a",
      "c",
      "b",
    ])
  })

  it("filters by brand but lists every brand for the filter", () => {
    const r = arrangeProducts(items, { brand: "k" })
    expect(r.items.map((p) => p.id)).toEqual(["a", "c"])
    expect(r.total).toBe(2)
    expect(r.brands).toEqual([
      { handle: "k", name: "K" },
      { handle: "u", name: "U" },
    ])
  })

  it(`pages by ${PER_PAGE} and clamps out-of-range pages`, () => {
    const many = Array.from({ length: PER_PAGE + 5 }, (_, i) => card(`p${i}`, i, "k"))
    expect(arrangeProducts(many, { page: 2 }).items).toHaveLength(5)
    expect(arrangeProducts(many, { page: 99 }).page).toBe(2)
    expect(arrangeProducts(many, { page: -3 }).page).toBe(1)
  })

  it("parses unknown sort values as 'featured'", () => {
    expect(parseSort("price-asc")).toBe("price-asc")
    expect(parseSort("drop table")).toBe("featured")
  })
})

describe("listingHref", () => {
  it("adds only non-default params and keeps an existing query", () => {
    expect(listingHref("/c/dashcams", { sort: "featured" })).toBe("/c/dashcams")
    expect(listingHref("/c/dashcams", { sort: "price-asc", brand: "kavach" }, 2)).toBe(
      "/c/dashcams?sort=price-asc&brand=kavach&page=2"
    )
    expect(listingHref("/c/dashcams?all=1", { sort: "newest" })).toBe(
      "/c/dashcams?all=1&sort=newest"
    )
  })
})

describe("car cookie", () => {
  it("round-trips a car and rejects junk", () => {
    const car = { makeId: "m", modelId: "c", year: 2021, variantId: "v", generationId: "g" }
    expect(decodeCarCookie(encodeCarCookie(car))).toEqual(car)
    expect(decodeCarCookie(undefined)).toBeUndefined()
    expect(decodeCarCookie("%7Bnot-json")).toBeUndefined()
    expect(decodeCarCookie(encodeURIComponent(JSON.stringify({ year: "x" })))).toBeUndefined()
  })
})
