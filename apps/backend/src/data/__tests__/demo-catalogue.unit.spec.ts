import { buildDemoCatalogue, DEMO_CATEGORIES } from "../demo-catalogue"
import { VEHICLES } from "../vehicles"

const catalogue = buildDemoCatalogue(VEHICLES)
const dupes = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) !== i)

describe("demo catalogue", () => {
  it("has 100–200 products across every category", () => {
    expect(catalogue.length).toBeGreaterThanOrEqual(100)
    expect(catalogue.length).toBeLessThanOrEqual(200)
    for (const category of DEMO_CATEGORIES) {
      expect(catalogue.some((p) => p.category === category.handle)).toBe(true)
    }
    expect(catalogue.every((p) => DEMO_CATEGORIES.some((c) => c.handle === p.category))).toBe(true)
  })

  it("has unique handles and SKUs", () => {
    expect(dupes(catalogue.map((p) => p.handle))).toEqual([])
    expect(dupes(catalogue.flatMap((p) => p.variants.map((v) => v.sku)))).toEqual([])
  })

  it("prices are whole rupees, positive and never above MRP", () => {
    for (const v of catalogue.flatMap((p) => p.variants)) {
      expect(Number.isInteger(v.price)).toBe(true)
      expect(v.price).toBeGreaterThan(0)
      expect(v.price).toBeLessThanOrEqual(v.mrp)
    }
  })

  it("every fitment points at a real generation and real variants", () => {
    for (const p of catalogue) {
      if (p.fitment === "universal") continue
      expect(p.fitment.length).toBeGreaterThan(0)
      for (const ref of p.fitment) {
        const gen = VEHICLES.find((m) => m.name === ref.make)
          ?.models.find((m) => m.name === ref.model)
          ?.generations.find((g) => g.name === ref.generation)
        expect(gen).toBeDefined()
        for (const name of ref.variants ?? []) {
          expect(gen!.variants.map((v) => v.name)).toContain(name)
        }
      }
    }
  })

  it("mixes universal, generation-wide and variant-specific fitment", () => {
    const kinds = new Set(
      catalogue.map((p) =>
        p.fitment === "universal"
          ? "universal"
          : p.fitment.some((r) => r.variants)
            ? "variant"
            : "generation"
      )
    )
    expect([...kinds].sort()).toEqual(["generation", "universal", "variant"])
  })

  it("splits seat covers by seat count, e.g. Kia Carens 6- and 7-seater", () => {
    const carens = catalogue.filter(
      (p) => p.category === "seat-covers" && p.title.startsWith("Carens")
    )
    expect(carens.map((p) => p.title).sort()).toEqual([
      expect.stringContaining("(6-seater)"),
      expect.stringContaining("(7-seater)"),
    ])
  })
})
