import { parseGarage, type GarageCar } from "./garage"

/**
 * The current car, mirrored from My Garage into a cookie so server-rendered pages
 * (category grids, product pages) can filter for it on the first render.
 * It only holds catalogue IDs and a year: nothing personal.
 */
export const CAR_COOKIE = "fg_car"
export const CAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function encodeCarCookie(car: GarageCar | undefined): string {
  return car ? encodeURIComponent(JSON.stringify(car)) : ""
}

export function decodeCarCookie(value: string | undefined): GarageCar | undefined {
  if (!value) return undefined
  try {
    return parseGarage(JSON.stringify({ current: JSON.parse(decodeURIComponent(value)) })).current
  } catch {
    return undefined
  }
}

/** Browser only: write (or clear) the cookie. */
export function writeCarCookie(car: GarageCar | undefined) {
  const value = encodeCarCookie(car)
  const age = car ? CAR_COOKIE_MAX_AGE : 0
  document.cookie = `${CAR_COOKIE}=${value}; Path=/; Max-Age=${age}; SameSite=Lax`
}
