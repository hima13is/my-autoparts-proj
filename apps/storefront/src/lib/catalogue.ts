import type { FitStatus } from "@autoparts/ui"
import { cacheLife, cacheTag } from "next/cache"
import { storeGet } from "./medusa"

/**
 * Server-side catalogue reads (categories, product lists, fit badges), each cached.
 * Product lists are fetched whole per category + car (at most a few hundred items)
 * and sorted/paged here, because Medusa can't sort by price. Search (Task 5) takes
 * over for very large lists.
 */

export const CATALOGUE_TAG = "catalogue"
const LIST_LIMIT = 200

export type Category = {
  id: string
  name: string
  handle: string
  description: string | null
  parent_category_id: string | null
}

type StoreVariant = {
  id: string
  title: string
  metadata?: { mrp?: number } | null
  calculated_price?: { calculated_amount: number | null } | null
}

export type StoreProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  brand?: { name: string; handle: string } | null
  categories?: { handle: string }[] | null
  variants: StoreVariant[]
}

export type CardProduct = {
  id: string
  handle: string
  title: string
  brand?: string
  brandHandle?: string
  thumbnail: string | null
  /** First category handle (picks placeholder art while products have no photos). */
  categoryHandle?: string
  price: number
  mrp?: number
}

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest"
export const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
]

export async function getRegionId(): Promise<string | undefined> {
  "use cache"
  cacheTag(CATALOGUE_TAG)
  try {
    const { regions } = await storeGet<{ regions: { id: string; currency_code: string }[] }>(
      "/store/regions",
      { fields: "id,currency_code" }
    )
    cacheLife("hours")
    return regions.find((r) => r.currency_code === "inr")?.id ?? regions[0]?.id
  } catch {
    cacheLife("minutes")
    return undefined
  }
}

export async function getCategories(): Promise<Category[]> {
  "use cache"
  cacheTag(CATALOGUE_TAG)
  try {
    const { product_categories } = await storeGet<{ product_categories: Category[] }>(
      "/store/product-categories",
      { fields: "id,name,handle,description,parent_category_id", limit: 200 }
    )
    cacheLife("hours")
    return product_categories
  } catch {
    cacheLife("minutes")
    return []
  }
}

/** Every product in the given categories (all when omitted), optionally only those fitting a car. */
export async function listProducts(
  opts: { categoryIds?: string[]; fit?: Record<string, string> } = {}
): Promise<StoreProduct[]> {
  "use cache"
  cacheTag(CATALOGUE_TAG)
  cacheLife("minutes")
  const regionId = await getRegionId()
  const { products } = await storeGet<{ products: StoreProduct[] }>("/store/products", {
    fields:
      "id,title,handle,thumbnail,created_at,*variants,*variants.calculated_price,+brand.name,+brand.handle,*categories",
    limit: LIST_LIMIT,
    order: "-created_at",
    region_id: regionId,
    "category_id[]": opts.categoryIds,
    ...opts.fit,
  })
  return products
}

/** Badge state per product for the shopper's car (or "universal"/"unknown" without one). */
export async function getFitSummary(
  productIds: string[],
  car: { variant_id?: string; generation_id?: string }
): Promise<Record<string, FitStatus>> {
  "use cache"
  cacheTag(CATALOGUE_TAG)
  cacheLife("minutes")
  if (productIds.length === 0) return {}
  try {
    const { fitment } = await storeGet<{ fitment: Record<string, FitStatus> }>(
      "/store/fitment/summary",
      { "product_id[]": productIds, ...car }
    )
    return fitment
  } catch {
    return {}
  }
}

/** Card data: the cheapest variant's price, with its MRP when it is higher. */
export function toCardProduct(p: StoreProduct): CardProduct {
  const priced = p.variants
    .map((v) => ({ price: v.calculated_price?.calculated_amount, mrp: v.metadata?.mrp }))
    .filter((v): v is { price: number; mrp: number | undefined } => typeof v.price === "number")
    .sort((a, b) => a.price - b.price)
  const cheapest = priced[0]
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    brand: p.brand?.name,
    brandHandle: p.brand?.handle,
    thumbnail: p.thumbnail,
    categoryHandle: p.categories?.[0]?.handle,
    price: cheapest?.price ?? 0,
    mrp: cheapest?.mrp && cheapest.mrp > cheapest.price ? cheapest.mrp : undefined,
  }
}

export const PER_PAGE = 24

/** Brand filter, sort and paging for a category grid. */
export function arrangeProducts(
  products: CardProduct[],
  { sort = "featured", brand, page = 1 }: { sort?: SortKey; brand?: string; page?: number }
) {
  const brands = [
    ...new Map(
      products.filter((p) => p.brandHandle).map((p) => [p.brandHandle!, p.brand!] as const)
    ),
  ]
    .map(([handle, name]) => ({ handle, name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const filtered = brand ? products.filter((p) => p.brandHandle === brand) : products
  const sorted = [...filtered]
  // Products arrive newest first; "featured" keeps that order until we have sales data.
  if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price)
  if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price)

  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const current = Math.min(Math.max(1, page), pages)
  return {
    items: sorted.slice((current - 1) * PER_PAGE, current * PER_PAGE),
    total: filtered.length,
    page: current,
    pages,
    brands,
  }
}

export function parseSort(value: unknown): SortKey {
  return SORTS.some((s) => s.value === value) ? (value as SortKey) : "featured"
}

/** Every product handle, for the sitemap. Empty (cached briefly) when the backend is down. */
export async function listProductHandles(): Promise<{ handle: string }[]> {
  "use cache"
  cacheTag(CATALOGUE_TAG)
  try {
    const { products } = await storeGet<{ products: { handle: string }[] }>("/store/products", {
      fields: "handle",
      limit: LIST_LIMIT,
    })
    cacheLife("hours")
    return products
  } catch {
    cacheLife("minutes")
    return []
  }
}
