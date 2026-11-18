import type { SearchTypes } from "@medusajs/framework/types"

/**
 * "Fits my car" for search. Each fitment rule becomes one key on the product document:
 *   universal → "all" · whole generation → "g:<generation_id>" · one trim → "v:<variant_id>"
 * A car then matches with `fit_keys $overlaps carFitKeys(...)`, which gives exactly the same
 * answer as checkFitment() in src/lib/fitment.ts.
 */
export type FitRuleRow = {
  product_id: string
  generation_id: string | null
  variant_id: string | null
}

export function fitKey(rule: Omit<FitRuleRow, "product_id">): string {
  if (rule.variant_id) return `v:${rule.variant_id}`
  if (rule.generation_id) return `g:${rule.generation_id}`
  return "all"
}

/** Keys that fit a car: always "all", plus its generation, plus its trim when known. */
export function carFitKeys(car: { generation_id: string; variant_id?: string | null }): string[] {
  return ["all", `g:${car.generation_id}`, ...(car.variant_id ? [`v:${car.variant_id}`] : [])]
}

/** Fitment keys per product, read through Query (the vehicle module's `fitment` entity). */
export async function loadFitKeys(
  productIds: string[],
  { container: { query } }: SearchTypes.SearchIngestionContext
): Promise<Map<string, string[]>> {
  const keys = new Map<string, string[]>()
  if (!productIds.length) return keys
  const { data } = await query.graph({
    entity: "fitment",
    fields: ["product_id", "generation_id", "variant_id"],
    filters: { product_id: productIds },
  })
  for (const row of data as FitRuleRow[]) {
    const list = keys.get(row.product_id) ?? []
    const key = fitKey(row)
    if (!list.includes(key)) list.push(key)
    keys.set(row.product_id, list)
  }
  return keys
}
