import { storeGet } from "./medusa"

/** Mirrors the backend's `DeliveryEstimate` (`apps/backend/src/lib/delivery.ts`). */
export type DeliveryEstimate =
  | { pincode: string; serviceable: false }
  | {
      pincode: string
      serviceable: true
      cod: boolean
      min_days: number
      max_days: number
      earliest: string
      latest: string
    }

/** Device-only memory of the last PIN code checked, so the next product page can reuse it. */
export const PIN_STORAGE_KEY = "fitgaadi:pin:v1"

/** Strips spaces (people type "110 001"); returns the PIN only if it is six digits. */
export function normalisePincode(value: string | null | undefined): string | null {
  const pin = (value ?? "").replace(/\s+/g, "")
  return /^\d{6}$/.test(pin) ? pin : null
}

const DAY = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

/** "2026-11-14" → "Sat, 14 Nov" (the backend already gives India dates). */
export function formatDay(isoDate: string): string {
  return DAY.format(new Date(`${isoDate}T00:00:00Z`))
}

/** The sentence shown under the PIN field. */
export function describeEstimate(estimate: DeliveryEstimate): string {
  if (!estimate.serviceable) return `Sorry, we don't deliver to ${estimate.pincode} yet.`
  const when =
    estimate.earliest === estimate.latest
      ? `by ${formatDay(estimate.latest)}`
      : `between ${formatDay(estimate.earliest)} and ${formatDay(estimate.latest)}`
  return `Delivery to ${estimate.pincode} ${when}.`
}

export async function getDeliveryEstimate(pincode: string): Promise<DeliveryEstimate> {
  const { estimate } = await storeGet<{ estimate: DeliveryEstimate }>("/store/delivery-estimate", {
    pincode,
  })
  return estimate
}
