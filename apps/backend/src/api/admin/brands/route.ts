import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { slugify } from "../../../lib/fitment"
import { BRAND_MODULE } from "../../../modules/brand"
import type BrandModuleService from "../../../modules/brand/service"
import { createBrandWorkflow } from "../../../workflows/brand"
import { parseBody } from "../vehicles/crud"

const CreateBrand = z
  .object({
    name: z.string().trim().min(1),
    handle: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes.")
      .optional(),
    description: z.string().trim().max(2000).nullish(),
    logo_url: z.url().nullish(),
  })
  .strict()

/** GET /admin/brands: all brands, A–Z. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const brands = await req.scope
    .resolve<BrandModuleService>(BRAND_MODULE)
    .listBrands({}, { order: { name: "ASC" }, take: null })
  res.json({ brands })
}

/** POST /admin/brands: create a brand; the handle defaults to the name as a slug. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = parseBody(CreateBrand, req.body)
  const handle = body.handle ?? slugify(body.name)
  const [clash] = await req.scope
    .resolve<BrandModuleService>(BRAND_MODULE)
    .listBrands({ handle }, { select: ["id"] })
  if (clash) {
    throw new MedusaError(
      MedusaError.Types.DUPLICATE_ERROR,
      "A brand with this handle already exists."
    )
  }
  const { result: brand } = await createBrandWorkflow(req.scope).run({
    input: { ...body, handle },
  })
  res.status(201).json({ brand })
}
