import {
  checkFitment,
  generationForYear,
  slugify,
  validateRule,
  yearsForModel,
  type FitmentRule,
} from "../fitment"

const NOW = 2026
// Hyundai Creta: 1st gen 2015–2019, 2nd gen 2020–on sale
const creta = [
  { id: "gen1", year_from: 2015, year_to: 2019 },
  { id: "gen2", year_from: 2020, year_to: null },
]

describe("generationForYear", () => {
  it("maps 2021 to the 2020–present generation", () => {
    expect(generationForYear(creta, 2021, NOW)?.id).toBe("gen2")
  })

  it("includes both boundary years", () => {
    expect(generationForYear(creta, 2015, NOW)?.id).toBe("gen1")
    expect(generationForYear(creta, 2019, NOW)?.id).toBe("gen1")
    expect(generationForYear(creta, 2020, NOW)?.id).toBe("gen2")
    expect(generationForYear(creta, NOW, NOW)?.id).toBe("gen2")
  })

  it("returns undefined outside every generation", () => {
    expect(generationForYear(creta, 2014, NOW)).toBeUndefined()
    expect(generationForYear(creta, NOW + 1, NOW)).toBeUndefined()
  })

  it("prefers the newer generation when two overlap in a changeover year", () => {
    const swift = [
      { id: "old", year_from: 2011, year_to: 2018 },
      { id: "new", year_from: 2018, year_to: 2023 },
    ]
    expect(generationForYear(swift, 2018, NOW)?.id).toBe("new")
  })
})

describe("yearsForModel", () => {
  it("lists every year once, newest first", () => {
    const years = yearsForModel(creta, NOW)
    expect(years[0]).toBe(NOW)
    expect(years.at(-1)).toBe(2015)
    expect(years).toHaveLength(NOW - 2015 + 1)
  })
})

describe("checkFitment", () => {
  const universal: FitmentRule = { generation_id: null, variant_id: null }
  const gen2: FitmentRule = { generation_id: "gen2", variant_id: null, notes: "Front seats only" }
  const gen2TopTrim: FitmentRule = { generation_id: "gen2", variant_id: "sx-o" }

  it("universal products always match", () => {
    expect(checkFitment([universal], { generation_id: "anything" })).toEqual({
      fits: true,
      universal: true,
      notes: [],
    })
  })

  it("generation-wide fitment matches every variant of that generation", () => {
    expect(checkFitment([gen2], { generation_id: "gen2", variant_id: "e" }).fits).toBe(true)
    expect(checkFitment([gen2], { generation_id: "gen2" }).fits).toBe(true)
  })

  it("does not match another generation", () => {
    expect(checkFitment([gen2], { generation_id: "gen1" }).fits).toBe(false)
  })

  it("variant-specific fitment only matches that variant", () => {
    expect(checkFitment([gen2TopTrim], { generation_id: "gen2", variant_id: "sx-o" }).fits).toBe(
      true
    )
    expect(checkFitment([gen2TopTrim], { generation_id: "gen2", variant_id: "e" }).fits).toBe(false)
    expect(checkFitment([gen2TopTrim], { generation_id: "gen2" }).fits).toBe(false)
  })

  it("collects notes from matching rules; not universal when a car rule matched", () => {
    expect(checkFitment([gen2, universal], { generation_id: "gen2" })).toEqual({
      fits: true,
      universal: false,
      notes: ["Front seats only"],
    })
  })

  it("does not fit a product without any fitment rules", () => {
    expect(checkFitment([], { generation_id: "gen2" }).fits).toBe(false)
  })
})

describe("validateRule", () => {
  it("rejects a variant without its generation", () => {
    expect(validateRule({ generation_id: null, variant_id: "v1" })).toMatch(/generation/)
  })

  it("accepts generation-wide, variant and universal rules", () => {
    expect(validateRule({ generation_id: "g", variant_id: null })).toBeNull()
    expect(validateRule({ generation_id: "g", variant_id: "v" })).toBeNull()
    expect(validateRule({ generation_id: null, variant_id: null })).toBeNull()
  })
})

describe("slugify", () => {
  it.each([
    ["Maruti Suzuki", "maruti-suzuki"],
    ["XUV 3XO", "xuv-3xo"],
    ["  Grand i10 Nios ", "grand-i10-nios"],
    ["Citroën C3", "citroen-c3"],
    ["Seat Covers & Cushions", "seat-covers-and-cushions"],
  ])("%s → %s", (input, slug) => {
    expect(slugify(input)).toBe(slug)
  })
})
