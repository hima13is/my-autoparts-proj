import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MODEL_FIELDS, notFound, vehicleService } from "../../../helpers"

/** GET /store/vehicles/makes/:makeId/models: the make's models, A–Z. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = vehicleService(req)
  const [make] = await service.listVehicleMakes({ id: req.params.makeId }, { select: ["id"] })
  if (!make) notFound("Make")

  const models = await service.listVehicleModels(
    { make_id: make.id },
    { select: MODEL_FIELDS, order: { name: "ASC" } }
  )
  res.json({ models })
}
