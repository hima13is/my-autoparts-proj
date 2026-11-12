import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { checkFitment, isUniversal } from "../../../../../lib/fitment"
import { vehicleService } from "../../../vehicles/helpers"

const asId = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null)

/**
 * GET /store/products/:id/fitment?variant_id=…   (or ?generation_id=… when no trim is picked)
 * Answers "does this product fit my car?" with any fitment notes.
 * Without a car it lists every car the product fits instead.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  let generationId = asId(req.query.generation_id)
  const variantId = asId(req.query.variant_id)

  const [product] = await req.scope
    .resolve(Modules.PRODUCT)
    .listProducts({ id: req.params.id, status: "published" }, { select: ["id"] })
  if (!product) throw new MedusaError(MedusaError.Types.NOT_FOUND, "The product was not found.")

  const vehicles = vehicleService(req)

  // No car: list every car the product fits (for the product page and its SEO text).
  if (!generationId && !variantId) {
    const rules = await vehicles.listFitments(
      { product_id: product.id },
      {
        select: [
          "generation_id",
          "variant_id",
          "notes",
          "generation.name",
          "generation.year_from",
          "generation.year_to",
          "generation.model.name",
          "generation.model.slug",
          "generation.model.make.name",
          "generation.model.make.slug",
          "variant.name",
        ],
        relations: ["generation", "generation.model", "generation.model.make", "variant"],
        take: null,
      }
    )
    const cars = rules
      .filter((r) => r.generation)
      .map((r) => ({
        make: r.generation!.model.make.name,
        make_slug: r.generation!.model.make.slug,
        model: r.generation!.model.name,
        model_slug: r.generation!.model.slug,
        generation: r.generation!.name,
        year_from: r.generation!.year_from,
        year_to: r.generation!.year_to,
        variant: r.variant?.name ?? null,
        notes: r.notes,
      }))
      .sort((a, b) =>
        `${a.make}${a.model}${a.year_from}`.localeCompare(`${b.make}${b.model}${b.year_from}`)
      )
    res.json({ product_id: product.id, universal: rules.some(isUniversal), cars })
    return
  }

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
