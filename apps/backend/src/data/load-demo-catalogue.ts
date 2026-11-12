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
  updateProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows"
import { VEHICLE_MODULE } from "../modules/vehicle"
import type VehicleModuleService from "../modules/vehicle/service"
import { slugify } from "../lib/fitment"
import { BRAND_MODULE } from "../modules/brand"
import type BrandModuleService from "../modules/brand/service"
import {
  DEMO_BRANDS,
  DEMO_CATEGORIES,
  DEMO_CATEGORY_GROUPS,
  type CarRef,
  type DemoCategory,
  type DemoProduct,
} from "./demo-catalogue"

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

  // Categories: groups first, then the categories under them. Create missing ones and
  // fix the parent of any category that was loaded before groups existed.
  const productModule = container.resolve(Modules.PRODUCT)
  const ensureCategories = async (wanted: DemoCategory[], parentIds: Map<string, string>) => {
    const existing = await productModule.listProductCategories(
      { handle: wanted.map((c) => c.handle) },
      { select: ["id", "handle", "parent_category_id"] }
    )
    const missing = wanted.filter((c) => !existing.some((e) => e.handle === c.handle))
    if (missing.length) {
      await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: missing.map((c) => ({
            name: c.name,
            handle: c.handle,
            description: c.description,
            is_active: true,
            parent_category_id: c.parent ? parentIds.get(c.parent) : null,
          })),
        },
      })
    }
    for (const row of existing) {
      const parent = wanted.find((c) => c.handle === row.handle)?.parent
      const parentId = parent ? parentIds.get(parent)! : null
      if (row.parent_category_id !== parentId) {
        await updateProductCategoriesWorkflow(container).run({
          input: { selector: { id: row.id }, update: { parent_category_id: parentId } },
        })
      }
    }
    const all = await productModule.listProductCategories(
      { handle: wanted.map((c) => c.handle) },
      { select: ["id", "handle"] }
    )
    return { created: missing.length, ids: new Map(all.map((c) => [c.handle, c.id])) }
  }
  const groups = await ensureCategories(DEMO_CATEGORY_GROUPS, new Map())
  const leaves = await ensureCategories(DEMO_CATEGORIES, groups.ids)
  const categoryId = leaves.ids
  const missingCategories = { length: groups.created + leaves.created }

  // Brands (create the missing ones).
  const brandService = container.resolve<BrandModuleService>(BRAND_MODULE)
  const brandHandles = DEMO_BRANDS.map(slugify)
  const haveBrands = await brandService.listBrands({ handle: brandHandles }, { select: ["handle"] })
  const newBrands = DEMO_BRANDS.filter(
    (name) => !haveBrands.some((b) => b.handle === slugify(name))
  )
  if (newBrands.length) {
    await brandService.createBrands(newBrands.map((name) => ({ name, handle: slugify(name) })))
  }
  const brands = await brandService.listBrands(
    { handle: brandHandles },
    { select: ["id", "handle"] }
  )
  const brandId = new Map(brands.map((b) => [b.handle, b.id]))

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
          metadata: { demo: true },
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

  // Link each demo product to its brand (also backfills products loaded before brands existed).
  const { data: withBrands } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "brand.id"],
    filters: { handle: products.map((p) => p.handle) },
  })
  const unlinked = (withBrands as { id: string; handle: string; brand?: { id: string } | null }[])
    .filter((row) => !row.brand)
    .map((row) => {
      const brand = products.find((p) => p.handle === row.handle)!.brand
      return {
        [Modules.PRODUCT]: { product_id: row.id },
        [BRAND_MODULE]: { brand_id: brandId.get(slugify(brand))! },
      }
    })
  if (unlinked.length) await container.resolve(ContainerRegistrationKeys.LINK).create(unlinked)

  return {
    brandsLinked: unlinked.length,
    categories: missingCategories.length,
    products: toCreate.length,
    skipped: products.length - toCreate.length,
    fitments,
  }
}
