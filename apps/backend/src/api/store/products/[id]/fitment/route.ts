import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { checkFitment } from "../../../../../lib/fitment"
import { vehicleService } from "../../../vehicles/helpers"

const asId = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null)

/**
 * GET /store/products/:id/fitment?variant_id=…   (or ?generation_id=… when no trim is picked)
 * Answers "does this product fit my car?" with any fitment notes.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  let generationId = asId(req.query.generation_id)
  const variantId = asId(req.query.variant_id)
  if (!generationId && !variantId) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Send `variant_id` or `generation_id`.")
  }

  const [product] = await req.scope
    .resolve(Modules.PRODUCT)
    .listProducts({ id: req.params.id, status: "published" }, { select: ["id"] })
  if (!product) throw new MedusaError(MedusaError.Types.NOT_FOUND, "The product was not found.")

  const vehicles = vehicleService(req)
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

  const rules = await vehicles.listFitments(
    { product_id: product.id },
    { select: ["generation_id", "variant_id", "notes"] }
  )
  const result = checkFitment(rules, { generation_id: generationId!, variant_id: variantId })
  res.json({
    product_id: product.id,
    generation_id: generationId,
    variant_id: variantId,
    ...result,
  })
}
