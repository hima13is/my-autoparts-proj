import { cacheLife, cacheTag } from "next/cache"
import { CATALOGUE_TAG, getRegionId, type StoreProduct } from "./catalogue"
import { storeGet, storePost } from "./medusa"

export const SEARCH_LIMIT = 48
export const MAX_QUERY_LENGTH = 80

/** Trim, collapse spaces and cap the length, so cache keys and requests stay sane. */
export function normaliseQuery(raw: unknown): string {
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH)
    : ""
}

/** Search keys for a car: same rules as the product fitment (see backend helpers/fitment-keys). */
export function carSearchKeys(car: { generationId?: string; variantId?: string } | undefined) {
  if (!car?.generationId) return undefined
  return ["all", `g:${car.generationId}`, ...(car.variantId ? [`v:${car.variantId}`] : [])]
}

/** Product IDs matching `q`, best match first, optionally only those that fit a car. */
export async function searchProductIds(q: string, fitKeys?: string[], take = SEARCH_LIMIT) {
  "use cache"
  cacheTag(CATALOGUE_TAG)
  cacheLife("minutes")
  if (!q) return []
  const { results } = await storePost<{ results: { hits: { id: string }[] }[] }>("/store/search", {
    queries: [
      {
        entity: "product",
        filters: { q, ...(fitKeys ? { fit_keys: { $overlaps: fitKeys } } : {}) },
        search_options: { typo_tolerance: true },
        pagination: { take },
      },
    ],
  })
  return results[0]?.hits.map((h) => h.id) ?? []
}

/** Card data for given product IDs, in the same order as `ids`. */
export async function getProductsByIds(ids: string[]): Promise<StoreProduct[]> {
  "use cache"
  cacheTag(CATALOGUE_TAG)
  cacheLife("minutes")
  if (!ids.length) return []
  const regionId = await getRegionId()
  const { products } = await storeGet<{ products: StoreProduct[] }>("/store/products", {
    "id[]": ids,
    fields:
      "id,title,handle,thumbnail,*variants,*variants.calculated_price,+brand.name,+brand.handle,*categories",
    region_id: regionId,
    limit: ids.length,
  })
  const byId = new Map(products.map((p) => [p.id, p]))
  return ids.map((id) => byId.get(id)).filter((p): p is StoreProduct => Boolean(p))
}

export type Suggestion = { id: string; title: string; handle: string }

/** Top matches for the header dropdown, read straight from the search index. */
export async function searchSuggestions(q: string, fitKeys?: string[]): Promise<Suggestion[]> {
  "use cache"
  cacheTag(CATALOGUE_TAG)
  cacheLife("minutes")
  if (q.length < 2) return []
  const { results } = await storePost<{
    results: { hits: { id: string; document: { title?: string; handle?: string } }[] }[]
  }>("/store/search", {
    queries: [
      {
        entity: "product",
        filters: { q, ...(fitKeys ? { fit_keys: { $overlaps: fitKeys } } : {}) },
        search_options: { typo_tolerance: true, match_strategy: "last" },
        pagination: { take: 6 },
      },
    ],
  })
  return (results[0]?.hits ?? [])
    .filter((h) => h.document.title && h.document.handle)
    .map((h) => ({ id: h.id, title: h.document.title!, handle: h.document.handle! }))
}
