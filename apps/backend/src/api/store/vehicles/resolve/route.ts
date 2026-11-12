import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { generationForYear } from "../../../../lib/fitment"
import {
  currentYear,
  GENERATION_FIELDS,
  MAKE_FIELDS,
  MODEL_FIELDS,
  notFound,
  parseYear,
  requireParam,
  vehicleService,
} from "../helpers"

/**
 * GET /store/vehicles/resolve?make=hyundai&model=creta[&year=2021]
 * Turns URL slugs into IDs for car landing pages. Without `year`, it returns every generation.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const makeSlug = requireParam(req.query.make, "make").toLowerCase()
  const modelSlug = requireParam(req.query.model, "model").toLowerCase()
  const year = req.query.year === undefined ? undefined : parseYear(req.query.year)
  const service = vehicleService(req)

  const [make] = await service.listVehicleMakes({ slug: makeSlug }, { select: MAKE_FIELDS })
  if (!make) notFound("Make")

  const [model] = await service.listVehicleModels(
    { make_id: make.id, slug: modelSlug },
    { select: MODEL_FIELDS }
  )
  if (!model) notFound("Model")

  const generations = await service.listVehicleGenerations(
    { model_id: model.id },
    { select: GENERATION_FIELDS, order: { year_from: "DESC" } }
  )

  if (year === undefined) {
    res.json({ make, model, generations })
    return
  }

  const generation = generationForYear(generations, year, currentYear())
  if (!generation) notFound(`A generation for ${year}`)
  res.json({ make, model, generation, year })
}
