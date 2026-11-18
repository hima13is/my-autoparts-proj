import { productImage, type ProductKind } from "@autoparts/ui/fixtures"

/**
 * Products have no photos until suppliers send them (images move to R2 in Phase 5),
 * so cards fall back to the design system's flat illustration for the category.
 */
const KIND_BY_CATEGORY: Record<string, ProductKind> = {
  "seat-covers": "seat-cover",
  "steering-covers": "seat-cover",
  "floor-mats": "floor-mat",
  dashcams: "dashcam",
  lighting: "led",
  "car-perfumes": "perfume",
  "phone-holders-chargers": "phone-holder",
  "car-care": "inflator",
  "car-covers": "cloth",
  sunshades: "cloth",
}

export function productImageFor(p: { thumbnail: string | null; categoryHandle?: string }): string {
  if (p.thumbnail) return p.thumbnail
  return productImage(KIND_BY_CATEGORY[p.categoryHandle ?? ""] ?? "cloth")
}
