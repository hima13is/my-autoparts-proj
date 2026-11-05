import { DEFAULT_REGION_STORE_POLICIES as p } from "../region-store-policies"

describe("DEFAULT_REGION_STORE_POLICIES (India)", () => {
  it("offers at least a 7-day return window", () => {
    expect(p.return_window_days).toBeGreaterThanOrEqual(7)
  })

  it("has min <= max for handling and transit days", () => {
    expect(p.handling_days_min).toBeLessThanOrEqual(p.handling_days_max)
    expect(p.transit_days_min).toBeLessThanOrEqual(p.transit_days_max)
  })

  it("promises delivery within 7 days at worst", () => {
    expect(p.handling_days_max + p.transit_days_max).toBeLessThanOrEqual(7)
  })
})
