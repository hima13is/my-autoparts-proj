import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { checkFitment, isUniversal } from "../../../../lib/fitment"
import { vehicleService } from "../../vehicles/helpers"

type Status = "fits" | "universal" | "no-fit" | "unknown"

const MAX_PRODUCTS = 100
const asId = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null)

/**
 * GET /store/fitment/summary?product_id[]=…&variant_id=… (or generation_id=…, or no car)
 * One badge state per product for a product grid, in a single call:
 *   universal: fits every car · fits: fits this car · no-fit: doesn't · unknown: no car chosen
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const raw = req.query.product_id
  const productIds = [...new Set((Array.isArray(raw) ? raw : raw ? [raw] : []).map(String))]
  if (productIds.length === 0 || productIds.length > MAX_PRODUCTS) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Send between 1 and ${MAX_PRODUCTS} \`product_id\` values.`
    )
  }

  const vehicles = vehicleService(req)
  const variantId = asId(req.query.variant_id)
  let generationId = asId(req.query.generation_id)
  if (variantId) {
    const [variant] = await vehicles.listVehicleVariants(
      { id: variantId },
      { select: ["generation_id"] }
    )
    if (!variant) throw new MedusaError(MedusaError.Types.NOT_FOUND, "The variant was not found.")
    generationId = variant.generation_id
  }

  const rules = await vehicles.listFitments(
    { product_id: productIds },
    { select: ["product_id", "generation_id", "variant_id", "notes"], take: null }
  )

  const fitment: Record<string, Status> = {}
  for (const id of productIds) {
    const own = rules.filter((r) => r.product_id === id)
    if (own.some(isUniversal)) fitment[id] = "universal"
    else if (!generationId) fitment[id] = "unknown"
    else {
      const car = { generation_id: generationId, variant_id: variantId }
      fitment[id] = checkFitment(own, car).fits ? "fits" : "no-fit"
    }
  }
  res.json({ fitment })
}
