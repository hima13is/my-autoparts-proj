import { describe, expect, it } from "vitest"
import { discountPercent, formatINR } from "../money"

describe("formatINR", () => {
  it("formats whole rupees without paise", () => {
    expect(formatINR(3499)).toBe("₹3,499")
  })

  it("uses Indian lakh grouping", () => {
    expect(formatINR(125000)).toBe("₹1,25,000")
    expect(formatINR(10000000)).toBe("₹1,00,00,000")
  })

  it("shows paise only when present", () => {
    expect(formatINR(3499.5)).toBe("₹3,499.50")
  })

  it("handles zero", () => {
    expect(formatINR(0)).toBe("₹0")
  })

  it("rejects non-numbers", () => {
    expect(() => formatINR(Number.NaN)).toThrow(RangeError)
  })
})

describe("discountPercent", () => {
  it("rounds down so we never overstate a discount", () => {
    expect(discountPercent(5999, 3499)).toBe(41) // 41.67% → 41
  })

  it("returns 0 when there is no discount", () => {
    expect(discountPercent(1000, 1000)).toBe(0)
    expect(discountPercent(1000, 1200)).toBe(0)
    expect(discountPercent(0, 0)).toBe(0)
  })
})
