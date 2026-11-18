import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { Suspense } from "react"
import { HomeHero } from "@/components/home-hero"
import { ListingSkeleton } from "@/components/listing"
import { ProductGrid } from "@/components/product-grid"
import { CAR_COOKIE, decodeCarCookie } from "@/lib/car-cookie"
import { getCategories, getFitSummary, listProducts, toCardProduct } from "@/lib/catalogue"
import { fitParams } from "@/lib/garage"
import { productImageFor } from "@/lib/product-image"
import { getVehicleCatalog } from "@/lib/vehicles"

export const metadata: Metadata = {
  title: "FitGaadi: car accessories that fit your car",
  description:
    "Car and SUV accessories for India, matched to your exact car. Sahi fit. Seedha ghar.",
  alternates: { canonical: "/" },
}

/** Popular cars to link from the home page (only the ones in the catalogue are shown). */
const POPULAR = [
  ["maruti-suzuki", "swift"],
  ["hyundai", "creta"],
  ["tata", "nexon"],
  ["mahindra", "thar"],
  ["kia", "seltos"],
  ["maruti-suzuki", "baleno"],
  ["toyota", "innova-crysta"],
  ["honda", "city"],
] as const

const heading = "mb-4 font-heading text-2xl font-bold text-ink"

export default async function HomePage() {
  const [categories, catalog] = await Promise.all([getCategories(), getVehicleCatalog()])
  const groups = categories.filter((c) => !c.parent_category_id)
  const leaves = categories.filter((c) => c.parent_category_id)
  const popular = POPULAR.flatMap(([makeSlug, modelSlug]) => {
    const make = catalog.makes.find((m) => m.slug === makeSlug)
    const model = make?.models.find((m) => m.slug === modelSlug)
    return make && model
      ? [{ href: `/cars/${makeSlug}/${modelSlug}`, name: `${make.name} ${model.name}` }]
      : []
  })

  return (
    <>
      <HomeHero />

      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 md:px-6">
        {leaves.length > 0 && (
          <section aria-labelledby="cats">
            <h2 id="cats" className={heading}>
              Shop by category
            </h2>
            <ul className="grid grid-cols-3 gap-3 md:grid-cols-5">
              {leaves.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/c/${c.handle}`}
                    className="flex h-full flex-col items-center gap-2 rounded-card border border-sand bg-white p-2 text-center text-sm font-semibold text-ink shadow-card hover:border-ink"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG art */}
                    <img
                      src={productImageFor({ thumbnail: null, categoryHandle: c.handle })}
                      alt=""
                      className="aspect-square w-full rounded-xl"
                    />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
            {groups.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                Browse:
                {groups.map((g) => (
                  <Link
                    key={g.id}
                    href={`/c/${g.handle}`}
                    className="font-semibold text-teal-600 underline"
                  >
                    {g.name}
                  </Link>
                ))}
              </p>
            )}
          </section>
        )}

        {popular.length > 0 && (
          <section aria-labelledby="cars">
            <h2 id="cars" className={heading}>
              Popular cars
            </h2>
            <ul className="flex flex-wrap gap-2">
              {popular.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="inline-flex min-h-tap items-center rounded-full border border-sand bg-white px-4 font-semibold text-ink hover:border-ink"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="new">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 id="new" className="font-heading text-2xl font-bold text-ink">
              New in
            </h2>
            <Link
              href="/c/interior"
              className="inline-flex min-h-tap items-center gap-1 font-semibold text-teal-600"
            >
              See more <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <Suspense fallback={<ListingSkeleton />}>
            <NewIn />
          </Suspense>
        </section>
      </div>
    </>
  )
}

/** The newest products that fit the shopper's car (or all, without one). */
async function NewIn() {
  const jar = await cookies()
  const car = decodeCarCookie(jar.get(CAR_COOKIE)?.value)
  let products
  try {
    products = (await listProducts({ fit: fitParams(car) })).slice(0, 8).map(toCardProduct)
  } catch {
    return <p className="text-graphite">Products will appear here shortly.</p>
  }
  const fit = await getFitSummary(
    products.map((p) => p.id),
    car ? { variant_id: car.variantId, generation_id: car.generationId } : {}
  )
  const catalog = await getVehicleCatalog()
  const short = car
    ? catalog.makes.find((m) => m.id === car.makeId)?.models.find((m) => m.id === car.modelId)?.name
    : undefined
  return <ProductGrid products={products} fit={fit} carShort={short} label="New in" />
}
