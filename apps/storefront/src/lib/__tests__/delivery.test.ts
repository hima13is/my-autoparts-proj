import { describe, expect, it } from "vitest"
import { describeEstimate, formatDay, normalisePincode } from "../delivery"

describe("normalisePincode", () => {
  it.each([
    ["110001", "110001"],
    [" 110 001 ", "110001"],
    ["000000", "000000"],
  ])("accepts %p", (input, pin) => expect(normalisePincode(input)).toBe(pin))

  it.each(["11001", "1100012", "11000a", "", null, undefined])("rejects %p", (input) =>
    expect(normalisePincode(input)).toBeNull()
  )
})

describe("formatDay", () => {
  it("shows the weekday, day and month", () => {
    expect(formatDay("2026-11-14")).toBe("Sat, 14 Nov")
  })
})

describe("describeEstimate", () => {
  const base = {
    pincode: "110001",
    serviceable: true as const,
    cod: true,
    min_days: 3,
    max_days: 5,
  }

  it("gives a range", () => {
    expect(describeEstimate({ ...base, earliest: "2026-11-14", latest: "2026-11-17" })).toBe(
      "Delivery to 110001 between Sat, 14 Nov and Tue, 17 Nov."
    )
  })
  it("gives one date when the range is a single day", () => {
    expect(describeEstimate({ ...base, earliest: "2026-11-14", latest: "2026-11-14" })).toBe(
      "Delivery to 110001 by Sat, 14 Nov."
    )
  })
  it("apologises when we don't deliver there", () => {
    expect(describeEstimate({ pincode: "000000", serviceable: false })).toBe(
      "Sorry, we don't deliver to 000000 yet."
    )
  })
})
