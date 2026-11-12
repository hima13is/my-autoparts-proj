import { cacheLife, cacheTag } from "next/cache"
import { CATALOGUE_TAG, getRegionId, toCardProduct, type StoreProduct } from "./catalogue"
import { storeGet } from "./medusa"

export type ProductDetail = StoreProduct & {
  description: string | null
  images: { url: string }[]
}

export type FitCar = {
  make: string
  make_slug: string
  model: string
  model_slug: string
  generation: string
  year_from: number
  year_to: number | null
  variant: string | null
  notes: string | null
}

export type ProductFit =
  | { kind: "list"; universal: boolean; cars: FitCar[] }
  | { kind: "check"; fits: boolean; universal: boolean; notes: string[] }

export type BuyVariant = { id: string; title: string; price: number; mrp?: number }

/** One product by handle (published, in the store's sales channel), or undefined. */
export async function getProduct(handle: string): Promise<ProductDetail | undefined> {
  "use cache"
  cacheTag(CATALOGUE_TAG)
  cacheLife("minutes")
  const regionId = await getRegionId()
  const { products } = await storeGet<{ products: ProductDetail[] }>("/store/products", {
    handle,
    fields:
      "id,title,handle,description,thumbnail,*images,*variants,*variants.calculated_price,+brand.name,+brand.handle,*categories",
    region_id: regionId,
    limit: 1,
  })
  return products[0]
}

/** Fit verdict for a car, or (without one) the list of cars the product fits. */
export async function getProductFit(
  productId: string,
  car: { variant_id?: string; generation_id?: string }
): Promise<ProductFit> {
  "use cache"
  cacheTag(CATALOGUE_TAG)
  cacheLife("minutes")
  const res = await storeGet<{
    universal: boolean
    fits?: boolean
    notes?: string[]
    cars?: FitCar[]
  }>(`/store/products/${productId}/fitment`, car)
  return res.cars
    ? { kind: "list", universal: res.universal, cars: res.cars }
    : { kind: "check", fits: Boolean(res.fits), universal: res.universal, notes: res.notes ?? [] }
}

/** Priced variants for the buy box, cheapest first. */
export function buyVariants(p: StoreProduct): BuyVariant[] {
  return p.variants
    .map((v) => {
      const card = toCardProduct({ ...p, variants: [v] })
      return { id: v.id, title: v.title, price: card.price, mrp: card.mrp }
    })
    .filter((v) => v.price > 0)
    .sort((a, b) => a.price - b.price)
}

/** "2020–present", "2015–2019", "2024". */
export function yearRange(from: number, to: number | null): string {
  if (to === null) return `${from}–present`
  return from === to ? String(from) : `${from}–${to}`
}
