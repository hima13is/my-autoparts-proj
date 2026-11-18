import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { validateRule } from "../../../../../lib/fitment"
import { VEHICLE_MODULE } from "../../../../../modules/vehicle"
import type VehicleModuleService from "../../../../../modules/vehicle/service"
import { parseBody } from "../../../vehicles/crud"
import { createFitmentWorkflow } from "../../../../../workflows/fitment"

const RuleSchema = z
  .object({
    generation_id: z.string().min(1).nullish(),
    variant_id: z.string().min(1).nullish(),
    notes: z.string().trim().max(500).nullish(),
    position: z.string().trim().max(50).nullish(),
    verified: z.boolean().optional(),
  })
  .strict()

const FITMENT_FIELDS = [
  "id",
  "product_id",
  "notes",
  "position",
  "verified",
  "generation_id",
  "variant_id",
  "generation.name",
  "generation.year_from",
  "generation.year_to",
  "variant.name",
]

async function requireProduct(req: MedusaRequest) {
  const [product] = await req.scope
    .resolve(Modules.PRODUCT)
    .listProducts({ id: req.params.id }, { select: ["id"] })
  if (!product) throw new MedusaError(MedusaError.Types.NOT_FOUND, "The product was not found.")
}

/** GET /admin/products/:id/fitment: every car this product is mapped to. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  await requireProduct(req)
  const fitments = await req.scope
    .resolve<VehicleModuleService>(VEHICLE_MODULE)
    .listFitments(
      { product_id: req.params.id },
      { select: FITMENT_FIELDS, relations: ["generation", "variant"] }
    )
  res.json({ fitments })
}

/**
 * POST /admin/products/:id/fitment: add one rule.
 * Send `generation_id` (whole generation), plus `variant_id` (one trim only), or neither (universal).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  await requireProduct(req)
  const body = parseBody(RuleSchema, req.body)
  const rule = {
    generation_id: body.generation_id ?? null,
    variant_id: body.variant_id ?? null,
  }
  const problem = validateRule(rule)
  if (problem) throw new MedusaError(MedusaError.Types.INVALID_DATA, problem)

  const vehicles = req.scope.resolve<VehicleModuleService>(VEHICLE_MODULE)
  if (rule.generation_id) {
    const [gen] = await vehicles.listVehicleGenerations({ id: rule.generation_id })
    if (!gen) throw new MedusaError(MedusaError.Types.NOT_FOUND, "The generation was not found.")
  }
  if (rule.variant_id) {
    const [variant] = await vehicles.listVehicleVariants({ id: rule.variant_id })
    if (!variant) throw new MedusaError(MedusaError.Types.NOT_FOUND, "The variant was not found.")
    if (variant.generation_id !== rule.generation_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The variant does not belong to that generation."
      )
    }
  }

  const [duplicate] = await vehicles.listFitments({ product_id: req.params.id, ...rule })
  if (duplicate) {
    throw new MedusaError(
      MedusaError.Types.DUPLICATE_ERROR,
      "This product is already mapped to that car."
    )
  }

  const { result: fitment } = await createFitmentWorkflow(req.scope).run({
    input: {
      product_id: req.params.id,
      ...rule,
      notes: body.notes ?? null,
      position: body.position ?? null,
      verified: body.verified ?? false,
    },
  })
  res.status(201).json({ fitment })
}
