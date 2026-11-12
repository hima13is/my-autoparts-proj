import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { BRAND_MODULE } from "../../../../../modules/brand"
import type BrandModuleService from "../../../../../modules/brand/service"
import { setProductBrandWorkflow } from "../../../../../workflows/brand"
import { parseBody } from "../../../vehicles/crud"

const SetBrand = z.object({ brand_id: z.string().min(1).nullable() }).strict()

/** POST /admin/products/:id/brand: `{ brand_id }` sets the brand, `{ brand_id: null }` clears it. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { brand_id } = parseBody(SetBrand, req.body)

  const [product] = await req.scope
    .resolve(Modules.PRODUCT)
    .listProducts({ id: req.params.id }, { select: ["id"] })
  if (!product) throw new MedusaError(MedusaError.Types.NOT_FOUND, "The product was not found.")

  if (brand_id) {
    const [brand] = await req.scope
      .resolve<BrandModuleService>(BRAND_MODULE)
      .listBrands({ id: brand_id }, { select: ["id"] })
    if (!brand) throw new MedusaError(MedusaError.Types.NOT_FOUND, "The brand was not found.")
  }

  await setProductBrandWorkflow(req.scope).run({ input: { product_id: product.id, brand_id } })
  res.json({ product_id: product.id, brand_id })
}
