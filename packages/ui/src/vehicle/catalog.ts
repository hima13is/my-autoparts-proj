/** Shape of the make → model → year → variant tree the vehicle selector browses. */
export interface VehicleCatalog {
  makes: ReadonlyArray<{
    id: string
    name: string
    /** URL slug, e.g. "maruti-suzuki" (for /cars/… pages). */
    slug?: string
    models: ReadonlyArray<{
      id: string
      name: string
      slug?: string
      years: ReadonlyArray<{
        year: number
        /** The generation on sale that year (used to filter when no variant is picked). */
        generationId?: string
        variants: ReadonlyArray<{ id: string; name: string }>
      }>
    }>
  }>
}

export interface SelectedVehicle {
  makeId: string
  modelId: string
  year: number
  /** Optional: many accessories fit every variant of a model year. */
  variantId?: string
}

export function findVehicle(catalog: VehicleCatalog, sel: Partial<SelectedVehicle>) {
  const make = catalog.makes.find((m) => m.id === sel.makeId)
  const model = make?.models.find((m) => m.id === sel.modelId)
  const year = model?.years.find((y) => y.year === sel.year)
  const variant = year?.variants.find((v) => v.id === sel.variantId)
  return { make, model, year, variant }
}

/** "Hyundai Creta 2021 SX Diesel" */
export function vehicleLabel(catalog: VehicleCatalog, sel: SelectedVehicle): string {
  const { make, model, variant } = findVehicle(catalog, sel)
  return [make?.name, model?.name, sel.year, variant?.name].filter(Boolean).join(" ")
}

/** "Creta" (for badges like "Fits Creta"). */
export function vehicleShortLabel(catalog: VehicleCatalog, sel: SelectedVehicle): string {
  return findVehicle(catalog, sel).model?.name ?? ""
}
