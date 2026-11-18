import type { VehicleCatalog } from "@autoparts/ui"
import { describe, expect, it } from "vitest"
import {
  EMPTY_GARAGE,
  GARAGE_LIMIT,
  clearCurrent,
  fitParams,
  parseGarage,
  pruneGarage,
  removeCar,
  selectCar,
  withGeneration,
} from "../garage"

const catalog: VehicleCatalog = {
  makes: [
    {
      id: "hyundai",
      name: "Hyundai",
      models: [
        {
          id: "creta",
          name: "Creta",
          years: [
            { year: 2021, generationId: "gen2", variants: [{ id: "sxo", name: "SX(O)" }] },
            { year: 2018, generationId: "gen1", variants: [{ id: "s", name: "S" }] },
          ],
        },
      ],
    },
  ],
}
const creta2021 = { makeId: "hyundai", modelId: "creta", year: 2021 }
const creta2021sxo = { ...creta2021, variantId: "sxo" }

describe("garage", () => {
  it("fills the generation for the chosen year", () => {
    expect(withGeneration(catalog, creta2021).generationId).toBe("gen2")
    expect(withGeneration(catalog, { ...creta2021, year: 2018 }).generationId).toBe("gen1")
  })

  it("selecting a car makes it current and moves it to the top without duplicates", () => {
    let s = selectCar(EMPTY_GARAGE, creta2021)
    s = selectCar(s, creta2021sxo)
    s = selectCar(s, creta2021)
    expect(s.current).toEqual(creta2021)
    expect(s.saved).toEqual([creta2021, creta2021sxo])
  })

  it(`keeps at most ${GARAGE_LIMIT} cars`, () => {
    let s = EMPTY_GARAGE
    for (let year = 2015; year <= 2022; year++) s = selectCar(s, { ...creta2021, year })
    expect(s.saved).toHaveLength(GARAGE_LIMIT)
    expect(s.saved[0].year).toBe(2022)
  })

  it("removing the current car clears it; skipping keeps saved cars", () => {
    const s = selectCar(selectCar(EMPTY_GARAGE, creta2021sxo), creta2021)
    expect(removeCar(s, creta2021)).toEqual({ current: undefined, saved: [creta2021sxo] })
    expect(clearCurrent(s)).toEqual({ current: undefined, saved: s.saved })
  })

  it("drops cars that are no longer in the catalogue", () => {
    const gone = { ...creta2021, variantId: "deleted" }
    const s = selectCar(selectCar(EMPTY_GARAGE, creta2021), gone)
    expect(pruneGarage(s, catalog)).toEqual({ current: undefined, saved: [creta2021] })
    const fine = selectCar(EMPTY_GARAGE, creta2021)
    expect(pruneGarage(fine, catalog)).toBe(fine)
  })

  it("builds the product filter: variant first, else the generation", () => {
    expect(fitParams(undefined)).toEqual({})
    expect(fitParams({ ...creta2021sxo, generationId: "gen2" })).toEqual({ fits_variant_id: "sxo" })
    expect(fitParams({ ...creta2021, generationId: "gen2" })).toEqual({
      fits_generation_id: "gen2",
    })
  })

  it("reads stored data defensively", () => {
    expect(parseGarage(null)).toEqual(EMPTY_GARAGE)
    expect(parseGarage("not json")).toEqual(EMPTY_GARAGE)
    expect(
      parseGarage(JSON.stringify({ current: { makeId: 1 }, saved: [creta2021, "x"] }))
    ).toEqual({
      current: undefined,
      saved: [creta2021],
    })
  })
})
