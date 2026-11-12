import { findVehicle, type SelectedVehicle, type VehicleCatalog } from "@autoparts/ui"

/**
 * My Garage: the shopper's chosen car plus up to five recent cars, kept on this device.
 * (Saving cars to an account comes with accounts in Phase 3.)
 * Pure functions here; the browser store is in `garage-store.ts`.
 */
export interface GarageCar extends SelectedVehicle {
  /** Generation on sale in `year`: used to filter products when no variant is picked. */
  generationId?: string
}

export interface GarageState {
  current?: GarageCar
  saved: GarageCar[]
}

export const GARAGE_LIMIT = 5
export const EMPTY_GARAGE: GarageState = { saved: [] }

export function sameCar(a: SelectedVehicle, b: SelectedVehicle): boolean {
  return (
    a.makeId === b.makeId &&
    a.modelId === b.modelId &&
    a.year === b.year &&
    (a.variantId ?? null) === (b.variantId ?? null)
  )
}

/** Fill in the generation for the chosen year from the catalogue. */
export function withGeneration(catalog: VehicleCatalog, car: SelectedVehicle): GarageCar {
  const { year } = findVehicle(catalog, car)
  return { ...car, generationId: year?.generationId }
}

/** Make `car` the current car and move it to the top of the saved list. */
export function selectCar(state: GarageState, car: GarageCar): GarageState {
  return {
    current: car,
    saved: [car, ...state.saved.filter((c) => !sameCar(c, car))].slice(0, GARAGE_LIMIT),
  }
}

export function removeCar(state: GarageState, car: SelectedVehicle): GarageState {
  return {
    current: state.current && sameCar(state.current, car) ? undefined : state.current,
    saved: state.saved.filter((c) => !sameCar(c, car)),
  }
}

/** "Skip": browse everything without a car (saved cars stay). */
export function clearCurrent(state: GarageState): GarageState {
  return { ...state, current: undefined }
}

/** Drop cars that no longer exist in the catalogue (e.g. a variant removed in the admin). */
export function pruneGarage(state: GarageState, catalog: VehicleCatalog): GarageState {
  const exists = (car: SelectedVehicle) => {
    const found = findVehicle(catalog, car)
    return Boolean(found.year && (!car.variantId || found.variant))
  }
  const current = state.current && exists(state.current) ? state.current : undefined
  const saved = state.saved.filter(exists)
  if (current === state.current && saved.length === state.saved.length) return state
  return { current, saved }
}

/** Query parameters for the "fits my car" product filter. */
export function fitParams(car: GarageCar | undefined): Record<string, string> {
  if (!car) return {}
  if (car.variantId) return { fits_variant_id: car.variantId }
  return car.generationId ? { fits_generation_id: car.generationId } : {}
}

/** Parse what was stored on the device; anything unexpected becomes an empty garage. */
export function parseGarage(raw: string | null): GarageState {
  if (!raw) return EMPTY_GARAGE
  try {
    const value = JSON.parse(raw) as Partial<GarageState>
    const isCar = (c: unknown): c is GarageCar =>
      typeof c === "object" &&
      c !== null &&
      typeof (c as GarageCar).makeId === "string" &&
      typeof (c as GarageCar).modelId === "string" &&
      typeof (c as GarageCar).year === "number"
    return {
      current: isCar(value.current) ? value.current : undefined,
      saved: Array.isArray(value.saved) ? value.saved.filter(isCar).slice(0, GARAGE_LIMIT) : [],
    }
  } catch {
    return EMPTY_GARAGE
  }
}
