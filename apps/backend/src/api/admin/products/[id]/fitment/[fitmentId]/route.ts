import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { VEHICLE_MODULE } from "../../../../../../modules/vehicle"
import type VehicleModuleService from "../../../../../../modules/vehicle/service"
import { deleteFitmentWorkflow } from "../../../../../../workflows/fitment"

/** DELETE /admin/products/:id/fitment/:fitmentId: remove one rule from this product. */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const vehicles = req.scope.resolve<VehicleModuleService>(VEHICLE_MODULE)
  const [fitment] = await vehicles.listFitments({
    id: req.params.fitmentId,
    product_id: req.params.id,
  })
  if (!fitment) throw new MedusaError(MedusaError.Types.NOT_FOUND, "The fitment was not found.")

  await deleteFitmentWorkflow(req.scope).run({
    input: { id: fitment.id, product_id: req.params.id },
  })
  res.json({ id: fitment.id, object: "fitment", deleted: true })
}
