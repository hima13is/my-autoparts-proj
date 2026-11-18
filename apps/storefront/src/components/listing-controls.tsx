import { cn } from "@autoparts/ui"
import Link from "next/link"
import { SORTS, type SortKey } from "@/lib/catalogue"

type Params = { sort: SortKey; brand?: string }

/** Build `?sort=…&brand=…` links (page resets to 1 when a filter changes). */
export function listingHref(base: string, params: Params, page = 1) {
  // `base` may already carry a query (e.g. "/c/dashcams?all=1"): keep it.
  const [path, existing] = base.split("?")
  const q = new URLSearchParams(existing)
  if (params.sort !== "featured") q.set("sort", params.sort)
  if (params.brand) q.set("brand", params.brand)
  if (page > 1) q.set("page", String(page))
  const s = q.toString()
  return s ? `${path}?${s}` : path
}

const chip =
  "inline-flex min-h-tap items-center rounded-full border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
const on = "border-ink bg-ink text-white"
const off = "border-sand bg-white text-ink hover:border-ink"

/**
 * Sort and brand filter as plain links: they work before JavaScript loads, can be
 * shared, and each state has its own cacheable URL.
 */
export function ListingControls({
  base,
  params,
  brands,
  total,
}: {
  base: string
  params: Params
  brands: { handle: string; name: string }[]
  total: number
}) {
  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Sort products" className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-graphite">Sort:</span>
        {SORTS.map((s) => (
          <Link
            key={s.value}
            href={listingHref(base, { ...params, sort: s.value })}
            aria-current={params.sort === s.value ? "true" : undefined}
            className={cn(chip, params.sort === s.value ? on : off)}
            scroll={false}
          >
            {s.label}
          </Link>
        ))}
      </nav>
      {brands.length > 1 && (
        <nav aria-label="Filter by brand" className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-graphite">Brand:</span>
          <Link
            href={listingHref(base, { sort: params.sort })}
            aria-current={!params.brand ? "true" : undefined}
            className={cn(chip, !params.brand ? on : off)}
            scroll={false}
          >
            All
          </Link>
          {brands.map((b) => (
            <Link
              key={b.handle}
              href={listingHref(base, { ...params, brand: b.handle })}
              aria-current={params.brand === b.handle ? "true" : undefined}
              className={cn(chip, params.brand === b.handle ? on : off)}
              scroll={false}
            >
              {b.name}
            </Link>
          ))}
        </nav>
      )}
      <p className="text-sm text-graphite" role="status">
        {total} {total === 1 ? "product" : "products"}
      </p>
    </div>
  )
}
