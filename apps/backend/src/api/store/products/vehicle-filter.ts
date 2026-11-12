import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { VEHICLE_MODULE } from "../../../modules/vehicle"
import type VehicleModuleService from "../../../modules/vehicle/service"

/** Matches no product, so "nothing fits" still returns an empty, correctly paginated list. */
const NO_PRODUCT = "prod_none_fit"

const asId = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null)

/**
 * Adds "fits my car" filtering to Medusa's own `GET /store/products`:
 *   ?fits_variant_id=vvar_…        products for that trim (generation-wide, that trim, universal)
 *   ?fits_generation_id=vgen_…     products for a generation when no trim is picked
 *
 * It turns the car into the core route's `id` filter before the core validation runs, so
 * pricing, sorting, pagination and counts all keep working. Universal products are included.
 */
export async function vehicleFitFilter(
  req: MedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Registered as a method-less middleware, so it also sees /store/products/:id and other
  // methods. Only act on the list route itself.
  const path = req.originalUrl.split("?")[0].replace(/\/+$/, "")
  if (req.method !== "GET" || path !== "/store/products") return next()

  const query = req.query as Record<string, unknown>
  const variantId = asId(query.fits_variant_id)
  let generationId = asId(query.fits_generation_id)
  delete query.fits_variant_id
  delete query.fits_generation_id
  if (!variantId && !generationId) return next()

  const vehicles = req.scope.resolve<VehicleModuleService>(VEHICLE_MODULE)
  if (variantId) {
    const [variant] = await vehicles.listVehicleVariants(
      { id: variantId },
      { select: ["id", "generation_id"] }
    )
    if (!variant) throw new MedusaError(MedusaError.Types.NOT_FOUND, "The variant was not found.")
    if (generationId && generationId !== variant.generation_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The variant does not belong to that generation."
      )
    }
    generationId = variant.generation_id
  }

  // Same rules as checkFitment(): universal, whole generation, or this exact trim.
  const rules = await vehicles.listFitments(
    {
      $or: [
        { generation_id: null, variant_id: null },
        { generation_id: generationId!, variant_id: null },
        ...(variantId ? [{ generation_id: generationId!, variant_id: variantId }] : []),
      ],
    },
    { select: ["product_id"], take: null }
  )
  let ids = [...new Set(rules.map((r) => r.product_id))]

  // Respect an `id` filter the caller already sent.
  const requested = query.id
  if (requested !== undefined) {
    const wanted = new Set(Array.isArray(requested) ? requested.map(String) : [String(requested)])
    ids = ids.filter((id) => wanted.has(id))
  }
  query.id = ids.length ? ids : [NO_PRODUCT]
  next()
}
