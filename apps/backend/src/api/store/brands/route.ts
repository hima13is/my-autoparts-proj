import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../modules/brand"
import type BrandModuleService from "../../../modules/brand/service"

/** GET /store/brands: all brands, A–Z (for the brand filter on category pages). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const brands = await req.scope
    .resolve<BrandModuleService>(BRAND_MODULE)
    .listBrands(
      {},
      { select: ["id", "name", "handle", "logo_url"], order: { name: "ASC" }, take: null }
    )
  res.json({ brands })
}
