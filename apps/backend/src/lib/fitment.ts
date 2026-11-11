/**
 * Pure fitment rules (no database). Shared by the store API, admin API and seed scripts.
 */

export type GenerationYears = { id: string; year_from: number; year_to: number | null }

export type FitmentRule = {
  generation_id: string | null
  variant_id: string | null
  notes?: string | null
}

export type SelectedCar = { generation_id: string; variant_id?: string | null }

export type FitResult =
  { fits: true; universal: boolean; notes: string[] } | { fits: false; universal: false; notes: [] }

/** Last year a generation covers. Generations still on sale run to the current year. */
export function lastYear(gen: GenerationYears, currentYear: number): number {
  return gen.year_to ?? currentYear
}

/** The generation that was on sale in `year`, or undefined. On overlap, the newer generation wins. */
export function generationForYear<T extends GenerationYears>(
  generations: T[],
  year: number,
  currentYear: number
): T | undefined {
  return generations
    .filter((g) => g.year_from <= year && year <= lastYear(g, currentYear))
    .sort((a, b) => b.year_from - a.year_from)[0]
}

/** Every year in which any generation of a model was on sale, newest first. */
export function yearsForModel(generations: GenerationYears[], currentYear: number): number[] {
  const years = new Set<number>()
  for (const g of generations) {
    for (let y = g.year_from; y <= lastYear(g, currentYear); y++) years.add(y)
  }
  return [...years].sort((a, b) => b - a)
}

export function isUniversal(rule: FitmentRule): boolean {
  return rule.generation_id === null && rule.variant_id === null
}

/** Does one fitment rule cover the selected car? */
export function ruleMatches(rule: FitmentRule, car: SelectedCar): boolean {
  if (isUniversal(rule)) return true
  if (rule.generation_id !== car.generation_id) return false
  // Generation-wide rule: fits every variant, and also when the shopper hasn't picked a variant.
  if (rule.variant_id === null) return true
  // Variant-specific rule: only fits that exact variant.
  return rule.variant_id === (car.variant_id ?? null)
}

/** Combine all of a product's fitment rules into one answer for the selected car. */
export function checkFitment(rules: FitmentRule[], car: SelectedCar): FitResult {
  const matching = rules.filter((r) => ruleMatches(r, car))
  if (matching.length === 0) return { fits: false, universal: false, notes: [] }
  const notes = matching.map((r) => r.notes).filter((n): n is string => Boolean(n))
  return { fits: true, universal: matching.every(isUniversal), notes }
}

/** A rule with a variant must also name that variant's generation. */
export function validateRule(rule: FitmentRule): string | null {
  if (rule.variant_id !== null && rule.generation_id === null) {
    return "A variant-specific fitment must also set the generation."
  }
  return null
}

/** URL slug: "Maruti Suzuki" → "maruti-suzuki", "XUV 3XO" → "xuv-3xo". */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
