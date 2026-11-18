import { generationForYear, slugify } from "../../lib/fitment"
import { VEHICLES } from "../vehicles"

const NOW = 2026
const models = VEHICLES.flatMap((make) => make.models.map((model) => ({ make, model })))

const duplicates = (values: string[]) => values.filter((value, i) => values.indexOf(value) !== i)

describe("launch car list", () => {
  it("covers the major Indian makes and about 30 models", () => {
    expect(VEHICLES.map((m) => m.name)).toEqual(
      expect.arrayContaining([
        "Maruti Suzuki",
        "Hyundai",
        "Tata",
        "Mahindra",
        "Kia",
        "Toyota",
        "Honda",
      ])
    )
    expect(models.length).toBeGreaterThanOrEqual(30)
  })

  it("has unique slugs and names at every level", () => {
    expect(duplicates(VEHICLES.map((m) => slugify(m.name)))).toEqual([])
    for (const make of VEHICLES) {
      expect(duplicates(make.models.map((m) => slugify(m.name)))).toEqual([])
    }
    for (const { model } of models) {
      expect(duplicates(model.generations.map((g) => g.name))).toEqual([])
      for (const g of model.generations) {
        expect(duplicates(g.variants.map((v) => v.name))).toEqual([])
      }
    }
  })

  it.each(models.map(({ make, model }) => [`${make.name} ${model.name}`, model] as const))(
    "%s: sane year ranges, at most a one-year changeover overlap, and variants in every generation",
    (_label, model) => {
      const gens = [...model.generations].sort((a, b) => a.from - b.from)
      gens.forEach((g, i) => {
        expect(g.from).toBeGreaterThanOrEqual(2005)
        expect(g.from).toBeLessThanOrEqual(NOW)
        if (g.to !== null) expect(g.to).toBeGreaterThanOrEqual(g.from)
        // Only the newest generation can still be on sale.
        if (i < gens.length - 1) expect(g.to).not.toBeNull()
        if (i > 0) expect(g.from).toBeGreaterThanOrEqual(gens[i - 1].to!)
        expect(g.variants.length).toBeGreaterThan(0)
      })

      // Every year from launch to now resolves to exactly one generation.
      for (let year = gens[0].from; year <= NOW; year++) {
        const hit = generationForYear(
          gens.map((g) => ({ id: g.name, year_from: g.from, year_to: g.to })),
          year,
          NOW
        )
        if (gens.at(-1)!.to === null || year <= gens.at(-1)!.to!) expect(hit).toBeDefined()
      }
    }
  )
})
