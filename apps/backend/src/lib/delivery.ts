/**
 * PIN-code serviceability and delivery estimates.
 *
 * The courier answer comes from a `DeliveryProvider`. Until Shiprocket credentials exist
 * (PLAN §9 Q8) the `mockProvider` answers with zone-based transit times, so the storefront
 * and tests behave the same way they will with the real API.
 */

export type Serviceability =
  | { serviceable: false }
  | { serviceable: true; cod: boolean; transit: { min: number; max: number } }

export interface DeliveryProvider {
  check(pincode: string): Promise<Serviceability>
}

export type DeliveryEstimate =
  | { pincode: string; serviceable: false }
  | {
      pincode: string
      serviceable: true
      cod: boolean
      /** Working days, including the supplier's dispatch day. */
      min_days: number
      max_days: number
      /** Calendar dates (YYYY-MM-DD, India time). */
      earliest: string
      latest: string
    }

/** Days the supplier needs to hand the parcel to the courier (drop-shipping, ADR 0002). */
export const DISPATCH_DAYS = 1

/** A PIN code is six digits. Whether we deliver there is the provider's call. */
export function isPincode(value: unknown): value is string {
  return typeof value === "string" && /^\d{6}$/.test(value)
}

/**
 * Transit days by postal zone (the first digit), roughly what couriers quote from north India.
 * Zone 9 is the Army Postal Service and zone 0 doesn't exist: neither is served.
 */
const ZONE_TRANSIT: Record<string, { min: number; max: number }> = {
  "1": { min: 2, max: 4 }, // Delhi, Haryana, Punjab, Himachal, J&K
  "2": { min: 3, max: 5 }, // Uttar Pradesh, Uttarakhand
  "3": { min: 3, max: 5 }, // Rajasthan, Gujarat
  "4": { min: 3, max: 5 }, // Maharashtra, Goa, Madhya Pradesh, Chhattisgarh
  "5": { min: 4, max: 6 }, // Andhra Pradesh, Telangana, Karnataka
  "6": { min: 4, max: 6 }, // Tamil Nadu, Kerala
  "7": { min: 5, max: 7 }, // West Bengal, Odisha, North East
  "8": { min: 4, max: 6 }, // Bihar, Jharkhand
}

/** North-east sub-zones: slower, and couriers rarely offer cash on delivery there. */
const NORTH_EAST = /^7[89]/

export const mockProvider: DeliveryProvider = {
  async check(pincode) {
    const zone = ZONE_TRANSIT[pincode[0]]
    if (!zone) return { serviceable: false }
    if (NORTH_EAST.test(pincode))
      return { serviceable: true, cod: false, transit: { min: 6, max: 9 } }
    return { serviceable: true, cod: true, transit: zone }
  },
}

/** The provider in use. Shiprocket replaces the mock once credentials exist. */
export function deliveryProvider(): DeliveryProvider {
  return mockProvider
}

/** Today's date in India (YYYY-MM-DD), whatever the server's time zone. */
export function indiaToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now)
}

/** Adds working days (couriers don't deliver on Sundays) to a YYYY-MM-DD date. */
export function addWorkingDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  let left = days
  while (left > 0) {
    date.setUTCDate(date.getUTCDate() + 1)
    if (date.getUTCDay() !== 0) left--
  }
  return date.toISOString().slice(0, 10)
}

export async function estimateDelivery(
  pincode: string,
  provider: DeliveryProvider = deliveryProvider(),
  now: Date = new Date()
): Promise<DeliveryEstimate> {
  const answer = await provider.check(pincode)
  if (!answer.serviceable) return { pincode, serviceable: false }
  const min = answer.transit.min + DISPATCH_DAYS
  const max = answer.transit.max + DISPATCH_DAYS
  const today = indiaToday(now)
  return {
    pincode,
    serviceable: true,
    cod: answer.cod,
    min_days: min,
    max_days: max,
    earliest: addWorkingDays(today, min),
    latest: addWorkingDays(today, max),
  }
}
