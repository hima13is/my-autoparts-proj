import { EmptyState, vehicleLabel, vehicleShortLabel } from "@autoparts/ui"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { Suspense } from "react"
import { ChooseCarButton } from "@/components/car-actions"
import { ListingSkeleton } from "@/components/listing"
import { ProductGrid } from "@/components/product-grid"
import { CAR_COOKIE, decodeCarCookie } from "@/lib/car-cookie"
import { getCategories, getFitSummary, toCardProduct } from "@/lib/catalogue"
import { carSearchKeys, getProductsByIds, normaliseQuery, searchProductIds } from "@/lib/search"
import { getVehicleCatalog } from "@/lib/vehicles"

export const metadata: Metadata = {
  title: "Search · FitGaadi",
  // Result pages are endless and thin: keep them out of search engines.
  robots: { index: false, follow: true },
}

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-6">
      <Suspense fallback={<ListingSkeleton />}>
        <SearchResults {...props} />
      </Suspense>
    </div>
  )
}

async function SearchResults({ searchParams }: PageProps<"/search">) {
  const [search, jar, catalog] = await Promise.all([searchParams, cookies(), getVehicleCatalog()])
  const q = normaliseQuery(search.q)
  const showAll = search.all === "1"
  const car = decodeCarCookie(jar.get(CAR_COOKIE)?.value)
  const label = car ? vehicleLabel(catalog, car) : undefined
  const short = car ? vehicleShortLabel(catalog, car) : undefined

  if (!q) {
    return (
      <>
        <h1 className="font-heading text-3xl font-bold text-ink">Search</h1>
        <p className="text-graphite">
          Type what you need in the search box, for example &ldquo;seat cover&rdquo; or
          &ldquo;dashcam&rdquo;.
        </p>
      </>
    )
  }

  const keys = showAll ? undefined : carSearchKeys(car)
  let products
  try {
    products = (await getProductsByIds(await searchProductIds(q, keys))).map(toCardProduct)
  } catch {
    return (
      <>
        <h1 className="font-heading text-3xl font-bold text-ink">Results for &ldquo;{q}&rdquo;</h1>
        <EmptyState title="Search isn't available right now" headingLevel={2}>
          Please try again in a moment, or browse by category.
        </EmptyState>
      </>
    )
  }
  const fit = await getFitSummary(
    products.map((p) => p.id),
    car ? { variant_id: car.variantId, generation_id: car.generationId } : {}
  )
  const base = `/search?q=${encodeURIComponent(q)}`

  return (
    <>
      <h1 className="font-heading text-3xl font-bold text-ink">Results for &ldquo;{q}&rdquo;</h1>
      {label && keys ? (
        <p className="text-graphite">
          Showing what fits your <strong className="text-ink">{label}</strong>.{" "}
          <Link href={`${base}&all=1`} className="font-semibold text-teal-600 underline">
            Search all products
          </Link>
        </p>
      ) : label ? (
        <p className="text-graphite">
          Showing all products.{" "}
          <Link href={base} className="font-semibold text-teal-600 underline">
            Only show what fits your {short}
          </Link>
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4">
          <p className="flex-1 text-graphite">Select your car to see only what fits it.</p>
          <ChooseCarButton />
        </div>
      )}

      <p role="status" className="text-sm text-graphite">
        {products.length} {products.length === 1 ? "result" : "results"}
      </p>

      {products.length ? (
        <ProductGrid
          products={products}
          fit={fit}
          carShort={short}
          label={`Search results for ${q}`}
        />
      ) : (
        <NoResults q={q} />
      )}
    </>
  )
}

async function NoResults({ q }: { q: string }) {
  const categories = (await getCategories()).filter((c) => c.parent_category_id).slice(0, 6)
  return (
    <EmptyState title={`Nothing found for “${q}”`} headingLevel={2}>
      Try a shorter word, or browse a category:{" "}
      {categories.map((c, i) => (
        <span key={c.id}>
          {i > 0 && ", "}
          <Link href={`/c/${c.handle}`} className="font-semibold text-teal-600 underline">
            {c.name}
          </Link>
        </span>
      ))}
    </EmptyState>
  )
}
