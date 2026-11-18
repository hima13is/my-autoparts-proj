import {
  addWorkingDays,
  estimateDelivery,
  indiaToday,
  isPincode,
  mockProvider,
  type DeliveryProvider,
} from "../delivery"

// Thursday 12 Nov 2026, 20:00 UTC = Friday 13 Nov, 01:30 in India
const LATE_UTC = new Date("2026-11-12T20:00:00Z")
const WEDNESDAY_NOON_IST = new Date("2026-11-11T06:30:00Z")

describe("isPincode", () => {
  it.each(["110001", "000000", "560034"])("accepts %s", (pin) => expect(isPincode(pin)).toBe(true))
  it.each(["11001", "1100011", "11000a", " 110001", "", undefined, 110001])("rejects %p", (pin) =>
    expect(isPincode(pin)).toBe(false)
  )
})

describe("indiaToday", () => {
  it("uses the India date, not the server's", () => {
    expect(indiaToday(LATE_UTC)).toBe("2026-11-13")
  })
})

describe("addWorkingDays", () => {
  it("skips Sundays", () => {
    // Fri 13 Nov + 2 working days = Sat 14, (Sun 15 skipped), Mon 16
    expect(addWorkingDays("2026-11-13", 2)).toBe("2026-11-16")
  })
  it("crosses month and year ends", () => {
    expect(addWorkingDays("2026-12-30", 3)).toBe("2027-01-02")
  })
  it("returns the same date for zero days", () => {
    expect(addWorkingDays("2026-11-12", 0)).toBe("2026-11-12")
  })
})

describe("mockProvider", () => {
  it("serves Delhi with cash on delivery", async () => {
    expect(await mockProvider.check("110001")).toEqual({
      serviceable: true,
      cod: true,
      transit: { min: 2, max: 4 },
    })
  })
  it.each(["000000", "900001", "999999"])("does not serve %s", async (pin) => {
    expect(await mockProvider.check(pin)).toEqual({ serviceable: false })
  })
  it("serves the north east more slowly and without cash on delivery", async () => {
    expect(await mockProvider.check("781001")).toEqual({
      serviceable: true,
      cod: false,
      transit: { min: 6, max: 9 },
    })
  })
})

describe("estimateDelivery", () => {
  it("adds the supplier's dispatch day and gives India dates", async () => {
    // Wed 11 Nov: 3–5 working days → Sat 14 Nov to Tue 17 Nov (Sunday skipped)
    expect(await estimateDelivery("110001", mockProvider, WEDNESDAY_NOON_IST)).toEqual({
      pincode: "110001",
      serviceable: true,
      cod: true,
      min_days: 3,
      max_days: 5,
      earliest: "2026-11-14",
      latest: "2026-11-17",
    })
  })
  it("says so when the PIN is not served", async () => {
    expect(await estimateDelivery("000000", mockProvider)).toEqual({
      pincode: "000000",
      serviceable: false,
    })
  })
  it("uses whichever provider it is given", async () => {
    const slow: DeliveryProvider = {
      check: async () => ({ serviceable: true, cod: false, transit: { min: 10, max: 12 } }),
    }
    const estimate = await estimateDelivery("110001", slow, WEDNESDAY_NOON_IST)
    expect(estimate).toMatchObject({ min_days: 11, max_days: 13, cod: false })
  })
})
