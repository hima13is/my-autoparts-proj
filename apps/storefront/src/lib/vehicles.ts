import type { VehicleCatalog } from "@autoparts/ui"
import { cacheLife, cacheTag } from "next/cache"
import { storeGet } from "./medusa"

export const VEHICLES_TAG = "vehicles"

/**
 * The full car tree for the selector. Cars change rarely, so it is cached for hours.
 * If the backend can't be reached (e.g. during a build without one) it returns an empty
 * tree cached for seconds only, so the real list appears as soon as the backend answers.
 */
export async function getVehicleCatalog(): Promise<VehicleCatalog> {
  "use cache"
  cacheTag(VEHICLES_TAG)
  try {
    const catalog = await storeGet<VehicleCatalog>("/store/vehicles/catalog")
    cacheLife("hours")
    return catalog
  } catch {
    cacheLife("seconds")
    return { makes: [] }
  }
}
