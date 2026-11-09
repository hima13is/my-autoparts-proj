import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

/**
 * GET /admin/sentry-check: throws on purpose so we can confirm errors reach Sentry.
 * Admin routes need an admin login, so the public can't trigger it.
 */
export async function GET(_req: MedusaRequest, _res: MedusaResponse) {
  // UNEXPECTED_STATE maps to HTTP 500, so it is reported to Sentry.
  throw new MedusaError(
    MedusaError.Types.UNEXPECTED_STATE,
    "Sentry check: deliberate backend error"
  )
}
