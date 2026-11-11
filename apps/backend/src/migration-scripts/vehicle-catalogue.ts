import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { seedVehicles } from "../data/seed-vehicles"
import { VEHICLES } from "../data/vehicles"
import { VEHICLE_MODULE } from "../modules/vehicle"
import type VehicleModuleService from "../modules/vehicle/service"

/**
 * Loads the launch car list (real reference data, so it runs on every environment).
 * Runs once per database via `medusa db:migrate`. To add cars later, append to
 * `src/data/vehicles.ts` and run `medusa exec ./src/scripts/sync-vehicles.ts`.
 */
export default async function vehicle_catalogue({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const created = await seedVehicles(container.resolve<VehicleModuleService>(VEHICLE_MODULE), VEHICLES)
  logger.info(
    `Car list loaded: ${created.makes} makes, ${created.models} models, ` +
      `${created.generations} generations, ${created.variants} variants added.`,
  )
}
