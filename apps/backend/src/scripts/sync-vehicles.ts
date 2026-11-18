import type { ExecArgs } from "@medusajs/framework/types"
import vehicleCatalogue from "../migration-scripts/vehicle-catalogue"

/**
 * Re-applies `src/data/vehicles.ts`, adding only what is missing.
 * Run: `pnpm --filter @autoparts/backend exec medusa exec ./src/scripts/sync-vehicles.ts`
 */
export default async function syncVehicles(args: ExecArgs) {
  await vehicleCatalogue(args)
}
