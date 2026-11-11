import type { SearchTypes } from "@medusajs/framework/types"
import { defineSearchIndex, graphConsume, graphSeed, search } from "@medusajs/framework/utils"

import { ProductOptionRow, toOptionValues } from "./helpers/option-values"
import { loadPricing, priceFields, toProductPricing } from "./helpers/pricing"
import { loadFitKeys } from "./helpers/fitment-keys"
import { keywordsFor } from "./helpers/keywords"
// Medusa imports every file under src/search/ at boot: keep tests out of this folder.
import { PRODUCT_EVENTS } from "./helpers/events"
import { resolveProductIds } from "./helpers/resolve-product-ids"

const PRODUCT_GRAPH_FIELDS = [
  "id",
  "title",
  "description",
  "handle",
  "thumbnail",
  "status",
  "created_at",
  "sales_channels.id",
  "categories.name",
  "categories.handle",
  "brand.name",
  "tags.value",
  "options.title",
  "options.values.value",
]

type ProductRow = {
  id: string
  title?: string | null
  description?: string | null
  handle?: string | null
  thumbnail?: string | null
  status?: string | null
  created_at?: string | Date | null
  deleted_at?: string | Date | null
  sales_channels?: ({ id?: string | null } | null)[] | null
  categories?: ({ name?: string | null; handle?: string | null } | null)[] | null
  brand?: { name?: string | null } | null
  tags?: ({ value?: string | null } | null)[] | null
  options?: ProductOptionRow[] | null
}

const productFields = search.define({
  id: search.keyword().filterable().retrievable(),
  // Read by `/store/search` to scope the index; never returned to hits.
  status: search.keyword().filterable().retrievable(false),
  sales_channel_ids: search.keyword().array().filterable().retrievable(false),
  title: search.text().searchable({ weight: 3 }).sortable().retrievable(),
  description: search.text().searchable({ weight: 1 }),
  handle: search.keyword().retrievable(),
  // Returned on hits only: never filtered, sorted or faceted on.
  thumbnail: search.keyword().retrievable(),
  created_at: search.date().sortable().retrievable(),
  category: search.keyword().array().filterable().facetable().retrievable(),
  brand: search.keyword().filterable().facetable().searchable({ weight: 2 }).retrievable(),
  // Words shoppers type that aren't in titles ("cvr", "dash cam"): see helpers/keywords.ts.
  keywords: search.text().searchable({ weight: 2 }),
  // "Fits my car": "all" | "g:<generation>" | "v:<variant>" (see helpers/fitment-keys.ts).
  fit_keys: search.keyword().array().filterable().retrievable(false),
  labels: search.keyword().array().filterable().facetable().retrievable(),
  option_values: search
    .keyword()
    .array()
    .searchable({ weight: 2 })
    .filterable()
    .facetable()
    .retrievable(),
  ...priceFields,
})

type ProductDocument = SearchTypes.InferSearchDocumentType<typeof productFields>

function toDocument(
  product: ProductRow,
  pricing: Parameters<typeof toProductPricing>[0],
  fitKeys: string[]
): ProductDocument {
  const category = (product.categories ?? [])
    .map((productCategory) => productCategory?.name?.trim())
    .filter((name): name is string => Boolean(name))
  const labels = (product.tags ?? [])
    .map((tag) => tag?.value?.trim())
    .filter((value): value is string => Boolean(value))
  const salesChannelIds = (product.sales_channels ?? [])
    .map((salesChannel) => salesChannel?.id?.trim())
    .filter((id): id is string => Boolean(id))

  return {
    id: product.id,
    status: product.status ?? null,
    sales_channel_ids: salesChannelIds,
    title: product.title ?? null,
    description: product.description ?? null,
    handle: product.handle ?? null,
    thumbnail: product.thumbnail ?? null,
    created_at: product.created_at ?? null,
    category,
    brand: product.brand?.name ?? null,
    keywords: keywordsFor(
      (product.categories ?? []).map((c) => c?.handle).filter((h): h is string => Boolean(h))
    ),
    fit_keys: fitKeys,
    labels,
    option_values: toOptionValues(product.options),
    ...toProductPricing(pricing),
  }
}

/**
 * A row that returns no document leaves
 * the index: the helpers turn it into a delete on `consume` and on the
 * catch-up pass.
 */
const source = {
  fields: PRODUCT_GRAPH_FIELDS,
  transform: async (rows: ProductRow[], context: SearchTypes.SearchIngestionContext) => {
    const ids = rows.map((row) => row.id)
    const [pricing, fitKeys] = await Promise.all([
      loadPricing(ids, context),
      loadFitKeys(ids, context),
    ])

    return rows.map((row) => toDocument(row, pricing.get(row.id), fitKeys.get(row.id) ?? []))
  },
}

export default defineSearchIndex({
  name: "product",
  entity: "product",
  primary_key: "id",
  fields: productFields,
  settings: {
    typo_tolerance: { enabled: true },
  },
  events: PRODUCT_EVENTS,
  consume: graphConsume<typeof productFields, ProductRow>({
    ...source,
    resolve_ids: async (event, context) =>
      event.name === "fitment.changed"
        ? [(event.data as { product_id?: string })?.product_id].filter((id): id is string =>
            Boolean(id)
          )
        : resolveProductIds(event, context),
    is_delete: (event) => event.name === "product.deleted",
  }),
  seed: graphSeed<typeof productFields, ProductRow>(source),
})
