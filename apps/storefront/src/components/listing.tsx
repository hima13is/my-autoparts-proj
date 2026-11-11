import { EmptyState, Pagination, ProductCardSkeleton, Skeleton } from "@autoparts/ui"
import Link from "next/link"
import {
  arrangeProducts,
  getFitSummary,
  listProducts,
  parseSort,
  toCardProduct,
} from "@/lib/catalogue"
import { ListingControls, listingHref } from "./listing-controls"
import { ProductGrid } from "./product-grid"

type Search = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/**
 * A sortable, brand-filterable, paged product grid with fit badges.
 * `fit` filters to one car; `badgeCar` decides the badges ("Fits Creta" / "Fits all cars").
 */
export async function Listing({
  base,
  search,
  categoryIds,
  fit,
  badgeCar,
  carShort,
  label,
  empty,
}: {
  base: string
  search: Search
  categoryIds?: string[]
  fit: Record<string, string>
  badgeCar: { variant_id?: string; generation_id?: string }
  carShort?: string
  label: string
  empty: React.ReactNode
}) {
  const sort = parseSort(one(search.sort))
  const brand = one(search.brand)
  const page = Number(one(search.page)) || 1

  let products
  try {
    products = (await listProducts({ categoryIds, fit })).map(toCardProduct)
  } catch {
    return (
      <EmptyState title="We couldn't load products" headingLevel={2}>
        Please try again in a moment.
      </EmptyState>
    )
  }

  const result = arrangeProducts(products, { sort, brand, page })
  const fitStatus = await getFitSummary(
    result.items.map((p) => p.id),
    badgeCar
  )

  if (products.length === 0) return <>{empty}</>

  return (
    <div className="flex flex-col gap-4">
      <ListingControls
        base={base}
        params={{ sort, brand }}
        brands={result.brands}
        total={result.total}
      />
      <ProductGrid products={result.items} fit={fitStatus} carShort={carShort} label={label} />
      {result.pages > 1 && (
        <Pagination
          linkAs={Link}
          current={result.page}
          total={result.pages}
          href={(p) => listingHref(base, { sort, brand }, p)}
          className="py-4"
        />
      )}
    </div>
  )
}

export function ListingSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading products">
      <Skeleton className="h-11 w-full max-w-md" />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i}>
            <ProductCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  )
}
