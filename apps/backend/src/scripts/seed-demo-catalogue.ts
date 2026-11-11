import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { buildDemoCatalogue } from "../data/demo-catalogue"
import { loadDemoCatalogue } from "../data/load-demo-catalogue"
import { VEHICLES } from "../data/vehicles"

/**
 * Loads ~120 DEMO products for local and staging. Never run this against production.
 *
 * PowerShell, from apps/backend:
 *   $env:ALLOW_DEMO_DATA="true"; pnpm exec medusa exec ./src/scripts/seed-demo-catalogue.ts
 */
export default async function seedDemoCatalogue({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (process.env.ALLOW_DEMO_DATA !== "true") {
    logger.error("Refusing to load demo products: set ALLOW_DEMO_DATA=true (local/staging only).")
    process.exitCode = 1
    return
  }
  const result = await loadDemoCatalogue(container, buildDemoCatalogue(VEHICLES))
  logger.info(
    `Demo catalogue: ${result.products} products and ${result.fitments} fitment rows added, ` +
      `${result.categories} categories created, ${result.skipped} products already there.`
  )
}
