import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { VEHICLE_MODULE } from "../modules/vehicle"
import type VehicleModuleService from "../modules/vehicle/service"
import { DEMO_CATEGORIES, type CarRef, type DemoProduct } from "./demo-catalogue"

type FitmentRow = { product_id: string; generation_id: string | null; variant_id: string | null }

const carKey = (make: string, model: string, generation: string) => `${make}|${model}|${generation}`

/** Map "make|model|generation" to the generation ID and its variant IDs by name. */
async function carIndex(vehicles: VehicleModuleService) {
  const generations = await vehicles.listVehicleGenerations(
    {},
    { relations: ["model", "model.make", "variants"], take: null }
  )
  return new Map(
    generations.map((g) => [
      carKey(g.model.make.name, g.model.name, g.name),
      { id: g.id, variants: new Map(g.variants.map((v) => [v.name, v.id])) },
    ])
  )
}

/**
 * Load the demo catalogue: categories, products (published, INR prices, no stock tracking
 * because suppliers drop-ship) and fitment. Products whose handle already exists are skipped,
 * so it is safe to run again. Needs the car list and the "Website" sales channel.
 */
export async function loadDemoCatalogue(container: MedusaContainer, products: DemoProduct[]) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const vehicles = container.resolve<VehicleModuleService>(VEHICLE_MODULE)

  // Categories (create the missing ones).
  const productModule = container.resolve(Modules.PRODUCT)
  const existingCategories = await productModule.listProductCategories(
    { handle: DEMO_CATEGORIES.map((c) => c.handle) },
    { select: ["id", "handle"] }
  )
  const missingCategories = DEMO_CATEGORIES.filter(
    (c) => !existingCategories.some((e) => e.handle === c.handle)
  )
  if (missingCategories.length) {
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCategories.map((c) => ({
          name: c.name,
          handle: c.handle,
          description: c.description,
          is_active: true,
        })),
      },
    })
  }
  const categories = await productModule.listProductCategories(
    { handle: DEMO_CATEGORIES.map((c) => c.handle) },
    { select: ["id", "handle"] }
  )
  const categoryId = new Map(categories.map((c) => [c.handle, c.id]))

  const {
    data: [salesChannel],
  } = await query.graph({ entity: "sales_channel", fields: ["id"], filters: { name: "Website" } })
  const {
    data: [shippingProfile],
  } = await query.graph({ entity: "shipping_profile", fields: ["id"] })
  if (!salesChannel || !shippingProfile) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Run `medusa db:migrate` first: the Website sales channel is missing."
    )
  }

  const existing = await productModule.listProducts(
    { handle: products.map((p) => p.handle) },
    { select: ["handle"], take: null }
  )
  const have = new Set(existing.map((p) => p.handle))
  const toCreate = products.filter((p) => !have.has(p.handle))

  const cars = await carIndex(vehicles)
  const fitmentRows = (productId: string, fitment: DemoProduct["fitment"]): FitmentRow[] => {
    if (fitment === "universal")
      return [{ product_id: productId, generation_id: null, variant_id: null }]
    return fitment.flatMap((ref: CarRef): FitmentRow[] => {
      const car = cars.get(carKey(ref.make, ref.model, ref.generation))
      if (!car)
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Unknown car in demo catalogue: ${ref.model} ${ref.generation}`
        )
      if (!ref.variants) return [{ product_id: productId, generation_id: car.id, variant_id: null }]
      return ref.variants.map((name) => {
        const variantId = car.variants.get(name)
        if (!variantId)
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Unknown variant ${name} of ${ref.model} ${ref.generation}`
          )
        return { product_id: productId, generation_id: car.id, variant_id: variantId }
      })
    })
  }

  // Create in batches to keep each workflow transaction small.
  let fitments = 0
  for (let i = 0; i < toCreate.length; i += 25) {
    const batch = toCreate.slice(i, i + 25)
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: batch.map((p) => ({
          title: p.title,
          handle: p.handle,
          description: p.description,
          status: ProductStatus.PUBLISHED,
          category_ids: [categoryId.get(p.category)!],
          sales_channels: [{ id: salesChannel.id }],
          shipping_profile_id: shippingProfile.id,
          metadata: { brand: p.brand, demo: true },
          options: [{ title: "Colour", values: p.variants.map((v) => v.colour) }],
          variants: p.variants.map((v) => ({
            title: v.title,
            sku: v.sku,
            options: { Colour: v.colour },
            manage_inventory: false,
            prices: [{ currency_code: "inr", amount: v.price }],
            metadata: { mrp: v.mrp },
          })),
        })),
      },
    })
    const rows = result.flatMap((created) =>
      fitmentRows(created.id, batch.find((p) => p.handle === created.handle)!.fitment)
    )
    await vehicles.createFitments(rows)
    fitments += rows.length
  }

  return {
    categories: missingCategories.length,
    products: toCreate.length,
    skipped: products.length - toCreate.length,
    fitments,
  }
}
