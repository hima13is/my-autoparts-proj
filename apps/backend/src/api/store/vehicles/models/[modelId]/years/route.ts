import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { yearsForModel } from "../../../../../../lib/fitment"
import { currentYear, GENERATION_FIELDS, notFound, vehicleService } from "../../../helpers"

/** GET /store/vehicles/models/:modelId/years: every year the model was on sale, newest first. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = vehicleService(req)
  const [model] = await service.listVehicleModels({ id: req.params.modelId }, { select: ["id"] })
  if (!model) notFound("Model")

  const generations = await service.listVehicleGenerations(
    { model_id: model.id },
    { select: GENERATION_FIELDS }
  )
  res.json({ years: yearsForModel(generations, currentYear()) })
}
