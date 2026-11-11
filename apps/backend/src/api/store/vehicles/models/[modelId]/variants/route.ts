import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { generationForYear } from "../../../../../../lib/fitment"
import {
  currentYear,
  GENERATION_FIELDS,
  notFound,
  parseYear,
  VARIANT_FIELDS,
  vehicleService,
} from "../../../helpers"

/**
 * GET /store/vehicles/models/:modelId/variants?year=2021
 * Finds the generation on sale that year and returns it with its variants.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const year = parseYear(req.query.year)
  const service = vehicleService(req)
  const [model] = await service.listVehicleModels({ id: req.params.modelId }, { select: ["id"] })
  if (!model) notFound("Model")

  const generations = await service.listVehicleGenerations(
    { model_id: model.id },
    { select: GENERATION_FIELDS }
  )
  const generation = generationForYear(generations, year, currentYear())
  if (!generation) notFound(`A generation for ${year}`)

  const variants = await service.listVehicleVariants(
    { generation_id: generation.id },
    { select: VARIANT_FIELDS, order: { name: "ASC" } }
  )
  res.json({ generation, variants })
}
