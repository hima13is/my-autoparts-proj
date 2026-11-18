import { checkFitment, type FitmentRule } from "../fitment"
import { carFitKeys, fitKey } from "../../search/helpers/fitment-keys"
import { CATEGORY_KEYWORDS, keywordsFor } from "../../search/helpers/keywords"
import { DEMO_CATEGORIES } from "../../data/demo-catalogue"
import { PRODUCT_EVENTS } from "../../search/helpers/events"

describe("search fit keys", () => {
  const rules: FitmentRule[] = [
    { generation_id: null, variant_id: null },
    { generation_id: "g2", variant_id: null },
    { generation_id: "g2", variant_id: "sxo" },
    { generation_id: "g1", variant_id: null },
  ]
  const cars = [
    { generation_id: "g2", variant_id: "sxo" },
    { generation_id: "g2", variant_id: "e" },
    { generation_id: "g2" },
    { generation_id: "g1", variant_id: "s" },
    { generation_id: "g9" },
  ]

  it("keys each rule kind", () => {
    expect(rules.map(fitKey)).toEqual(["all", "g:g2", "v:sxo", "g:g1"])
  })

  it("matches exactly when checkFitment says a single rule fits", () => {
    for (const rule of rules) {
      for (const car of cars) {
        const bySearch = carFitKeys(car).includes(fitKey(rule))
        expect([rule, car, bySearch]).toEqual([rule, car, checkFitment([rule], car).fits])
      }
    }
  })
})

describe("search keywords", () => {
  it("has keywords for every demo category", () => {
    for (const c of DEMO_CATEGORIES) expect(CATEGORY_KEYWORDS[c.handle]?.length).toBeGreaterThan(0)
  })

  it("joins keywords for a product's categories without duplicates", () => {
    const words = keywordsFor(["seat-covers", "car-covers"]).split(" ")
    expect(words).toContain("cvr")
    expect(words.filter((w) => w === "cvr")).toHaveLength(1)
    expect(keywordsFor(["unknown"])).toBe("")
  })
})

describe("product index", () => {
  it("re-indexes a product when its fitment changes", () => {
    expect(PRODUCT_EVENTS).toContain("fitment.changed")
  })
})
