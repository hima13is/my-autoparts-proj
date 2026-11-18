import { Modules } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createRemoteLinkStep,
  dismissRemoteLinkStep,
  emitEventStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { BRAND_MODULE } from "../modules/brand"
import type BrandModuleService from "../modules/brand/service"

export type CreateBrandInput = {
  name: string
  handle: string
  description?: string | null
  logo_url?: string | null
}

const createBrandStep = createStep(
  "create-brand",
  async (input: CreateBrandInput, { container }) => {
    const brand = await container.resolve<BrandModuleService>(BRAND_MODULE).createBrands(input)
    return new StepResponse(brand, brand.id)
  },
  async (id, { container }) => {
    if (id) await container.resolve<BrandModuleService>(BRAND_MODULE).deleteBrands([id])
  }
)

export const createBrandWorkflow = createWorkflow("create-brand", (input: CreateBrandInput) => {
  return new WorkflowResponse(createBrandStep(input))
})

/** Set (or clear, with `brand_id: null`) the one brand a product belongs to. */
export const setProductBrandWorkflow = createWorkflow(
  "set-product-brand",
  (input: { product_id: string; brand_id: string | null }) => {
    const { data: current } = useQueryGraphStep({
      entity: "product",
      fields: ["id", "brand.id"],
      filters: { id: input.product_id },
    })

    // `brand` is a link field, so it is missing from the generated Product type.
    const oldBrandId = transform(
      { current },
      ({ current }) =>
        (current[0] as { brand?: { id: string } | null } | undefined)?.brand?.id ?? null
    )
    when({ oldBrandId }, ({ oldBrandId }) => Boolean(oldBrandId)).then(() => {
      const link = transform({ input, oldBrandId }, ({ input, oldBrandId }) => [
        {
          [Modules.PRODUCT]: { product_id: input.product_id },
          [BRAND_MODULE]: { brand_id: oldBrandId },
        },
      ])
      dismissRemoteLinkStep(link)
    })

    when({ input }, ({ input }) => Boolean(input.brand_id)).then(() => {
      const link = transform({ input }, ({ input }) => [
        {
          [Modules.PRODUCT]: { product_id: input.product_id },
          [BRAND_MODULE]: { brand_id: input.brand_id },
        },
      ])
      createRemoteLinkStep(link)
    })

    // Products are indexed for search with their brand, so re-index this product.
    const eventData = transform({ input }, ({ input }) => ({ id: input.product_id }))
    emitEventStep({ eventName: "product.updated", data: eventData })
    return new WorkflowResponse(input)
  }
)
