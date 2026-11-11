import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MAKE_FIELDS, vehicleService } from "../helpers"

/** GET /store/vehicles/makes: every car make, A–Z. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const makes = await vehicleService(req).listVehicleMakes(
    {},
    { select: MAKE_FIELDS, order: { name: "ASC" } }
  )
  res.json({ makes })
}
