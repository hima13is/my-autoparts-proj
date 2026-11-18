/**
 * Extra words shoppers type for each category: abbreviations, spellings and
 * Hinglish. Typo tolerance handles misspellings ("dascam"); this handles words
 * that aren't typos at all ("cvr", "seatcover", "camera").
 * Keyed by category handle. Add to it from the search logs after launch.
 */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "seat-covers": ["seat cover", "seatcover", "cvr", "covers", "seat cushion"],
  "floor-mats": ["floor mat", "floormat", "mats", "7d mat", "foot mat", "carpet"],
  "car-covers": ["body cover", "car cover", "cvr", "waterproof cover"],
  sunshades: ["sun shade", "sunshade", "window shade", "curtain", "sun visor"],
  lighting: ["led", "headlight", "head lamp", "bulb", "light"],
  dashcams: ["dash cam", "dashcam", "dash camera", "car camera", "recorder"],
  "car-perfumes": ["perfume", "air freshener", "freshener", "fragrance", "scent"],
  "car-care": ["cleaning", "wash", "polish", "shampoo", "microfiber", "microfibre"],
  "phone-holders-chargers": ["mobile holder", "phone stand", "charger", "car charger", "mount"],
  "steering-covers": ["steering cover", "steering wheel cover", "wheel cover"],
}

export function keywordsFor(categoryHandles: string[]): string {
  return [...new Set(categoryHandles.flatMap((h) => CATEGORY_KEYWORDS[h] ?? []))].join(" ")
}
