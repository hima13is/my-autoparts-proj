import { describe, expect, it } from "vitest"
import { carSearchKeys, MAX_QUERY_LENGTH, normaliseQuery } from "../search"

describe("normaliseQuery", () => {
  it("trims, collapses spaces and caps the length", () => {
    expect(normaliseQuery("  seat   cover ")).toBe("seat cover")
    expect(normaliseQuery(["dashcam", "x"])).toBe("dashcam")
    expect(normaliseQuery(undefined)).toBe("")
    expect(normaliseQuery("a".repeat(200))).toHaveLength(MAX_QUERY_LENGTH)
  })
})

describe("carSearchKeys", () => {
  it("matches universal, the generation and the trim", () => {
    expect(carSearchKeys(undefined)).toBeUndefined()
    expect(carSearchKeys({ generationId: "g" })).toEqual(["all", "g:g"])
    expect(carSearchKeys({ generationId: "g", variantId: "v" })).toEqual(["all", "g:g", "v:v"])
  })
})
