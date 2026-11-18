import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { estimateDelivery, isPincode } from "../../../lib/delivery"

/**
 * GET /store/delivery-estimate?pincode=110001
 * Whether we deliver to a PIN code and, if so, the expected delivery window.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pincode = typeof req.query.pincode === "string" ? req.query.pincode.trim() : ""
  if (!isPincode(pincode)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Enter a 6-digit PIN code.")
  }
  res.json({ estimate: await estimateDelivery(pincode) })
}
