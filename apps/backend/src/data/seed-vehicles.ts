import { slugify } from "../lib/fitment"
import type VehicleModuleService from "../modules/vehicle/service"
import type { SeedMake } from "./vehicles"

export type SeedCounts = { makes: number; models: number; generations: number; variants: number }

/**
 * Insert the car list. Safe to run again: makes, models and generations are matched by
 * slug/name and only missing ones are created. Variants are only added to generations this
 * run creates. After that they are managed in the admin, so a renamed or deleted variant is
 * never brought back. Existing rows are never changed.
 */
export async function seedVehicles(
  vehicles: VehicleModuleService,
  data: SeedMake[]
): Promise<SeedCounts> {
  const created: SeedCounts = { makes: 0, models: 0, generations: 0, variants: 0 }

  for (const makeData of data) {
    const makeSlug = slugify(makeData.name)
    let [make] = await vehicles.listVehicleMakes({ slug: makeSlug })
    if (!make) {
      make = await vehicles.createVehicleMakes({ name: makeData.name, slug: makeSlug })
      created.makes++
    }

    for (const modelData of makeData.models) {
      const modelSlug = slugify(modelData.name)
      let [model] = await vehicles.listVehicleModels({ make_id: make.id, slug: modelSlug })
      if (!model) {
        model = await vehicles.createVehicleModels({
          name: modelData.name,
          slug: modelSlug,
          body_type: modelData.body,
          make_id: make.id,
        })
        created.models++
      }

      for (const genData of modelData.generations) {
        const [existing] = await vehicles.listVehicleGenerations({
          model_id: model.id,
          name: genData.name,
        })
        if (existing) continue

        const generation = await vehicles.createVehicleGenerations({
          name: genData.name,
          year_from: genData.from,
          year_to: genData.to,
          model_id: model.id,
        })
        await vehicles.createVehicleVariants(
          genData.variants.map((variant) => ({
            name: variant.name,
            fuel: variant.fuel,
            transmission: variant.transmission,
            seats: variant.seats ?? modelData.seats,
            generation_id: generation.id,
          }))
        )
        created.generations++
        created.variants += genData.variants.length
      }
    }
  }

  return created
}
