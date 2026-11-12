import type { CardProduct } from "./catalogue"

/**
 * The public origin used for canonical URLs, the sitemap and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL once the real domain exists; until then Vercel's production URL.
 */
export function siteUrl(env: Record<string, string | undefined> = process.env): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "")
  if (explicit) return explicit
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  return "http://localhost:3000"
}

/**
 * Search engines may index the site only when ALLOW_INDEXING=true (production, at launch).
 * Staging runs on demo data, so it stays out of search results.
 */
export function indexingAllowed(env: Record<string, string | undefined> = process.env): boolean {
  return env.ALLOW_INDEXING === "true"
}

export const absoluteUrl = (path: string, base = siteUrl()) => new URL(path, base).toString()

export type Crumb = { label: string; href?: string }

/** schema.org BreadcrumbList. The last crumb (the current page) gets the page's own URL. */
export function breadcrumbJsonLd(crumbs: Crumb[], currentPath: string, base = siteUrl()) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      item: absoluteUrl(crumb.href ?? currentPath, base),
    })),
  }
}

/** schema.org Product with an INR offer (an AggregateOffer when variants differ in price). */
export function productJsonLd(
  product: {
    title: string
    handle: string
    description: string | null
    image: string
    brand?: string
    prices: number[]
  },
  base = siteUrl()
) {
  const url = absoluteUrl(`/p/${product.handle}`, base)
  const prices = [...new Set(product.prices)].sort((a, b) => a - b)
  const availability = "https://schema.org/InStock"
  const offers =
    prices.length > 1
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          lowPrice: prices[0],
          highPrice: prices[prices.length - 1],
          offerCount: prices.length,
          availability,
          url,
        }
      : prices.length === 1
        ? { "@type": "Offer", priceCurrency: "INR", price: prices[0], availability, url }
        : undefined
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    url,
    // Placeholder art is a data URI: search engines need a real image URL, so leave it out.
    ...(product.image.startsWith("data:") ? {} : { image: absoluteUrl(product.image, base) }),
    ...(product.description ? { description: product.description } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(offers ? { offers } : {}),
  }
}

/** JSON for a <script type="application/ld+json">: "<" is escaped so text can't close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export type SitemapInput = {
  categories: { handle: string }[]
  cars: { make: string; model: string }[]
  products: Pick<CardProduct, "handle">[]
}

/** Public, indexable pages only (no search, garage, status or prototype). */
export function sitemapPaths({ categories, cars, products }: SitemapInput): string[] {
  return [
    "/",
    ...categories.map((c) => `/c/${c.handle}`),
    ...cars.map((c) => `/cars/${c.make}/${c.model}`),
    ...products.map((p) => `/p/${p.handle}`),
  ]
}
