import { Breadcrumb, EmptyState, vehicleLabel, vehicleShortLabel } from "@autoparts/ui"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ChooseCarButton } from "@/components/car-actions"
import { Listing, ListingSkeleton } from "@/components/listing"
import { JsonLd } from "@/components/json-ld"
import { CAR_COOKIE, decodeCarCookie } from "@/lib/car-cookie"
import { getCategories } from "@/lib/catalogue"
import { fitParams } from "@/lib/garage"
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo"
import { getVehicleCatalog } from "@/lib/vehicles"

export async function generateMetadata({ params }: PageProps<"/c/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const category = (await getCategories()).find((c) => c.handle === handle)
  if (!category) return { title: "Category not found · FitGaadi" }
  return {
    title: `${category.name} for your car · FitGaadi`,
    description: category.description ?? `${category.name} matched to your exact car.`,
    alternates: { canonical: `/c/${category.handle}` },
  }
}

export default function CategoryPage(props: PageProps<"/c/[handle]">) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-6">
      <Suspense fallback={<ListingSkeleton />}>
        <CategoryContent {...props} />
      </Suspense>
    </div>
  )
}

async function CategoryContent({ params, searchParams }: PageProps<"/c/[handle]">) {
  const [{ handle }, search, categories, catalog, jar] = await Promise.all([
    params,
    searchParams,
    getCategories(),
    getVehicleCatalog(),
    cookies(),
  ])
  const category = categories.find((c) => c.handle === handle)
  if (!category) notFound()

  const parent = categories.find((c) => c.id === category.parent_category_id)
  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    ...(parent ? [{ label: parent.name, href: `/c/${parent.handle}` }] : []),
    { label: category.name },
  ]
  const children = categories.filter((c) => c.parent_category_id === category.id)
  const categoryIds = [category.id, ...children.map((c) => c.id)]

  const car = decodeCarCookie(jar.get(CAR_COOKIE)?.value)
  const showAll = search.all === "1"
  const carFit = fitParams(car)
  const label = car ? vehicleLabel(catalog, car) : undefined
  const short = car ? vehicleShortLabel(catalog, car) : undefined
  const base = `/c/${category.handle}`

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs, `/c/${category.handle}`)} />
      <Breadcrumb linkAs={Link} items={crumbs} />
      <h1 className="font-heading text-3xl font-bold text-ink">{category.name}</h1>

      {children.length > 0 && (
        <nav aria-label={`${category.name} categories`}>
          <ul className="flex flex-wrap gap-2">
            {children.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/c/${c.handle}`}
                  className="inline-flex min-h-tap items-center rounded-full border border-sand bg-white px-4 text-sm font-semibold text-ink hover:border-ink"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {label ? (
        <p className="text-graphite">
          {showAll ? (
            <>
              Showing all {category.name.toLowerCase()}.{" "}
              <Link href={base} className="font-semibold text-teal-600 underline">
                Only show what fits your {short}
              </Link>
            </>
          ) : (
            <>
              Showing what fits your <strong className="text-ink">{label}</strong>.{" "}
              <Link href={`${base}?all=1`} className="font-semibold text-teal-600 underline">
                Show all {category.name.toLowerCase()}
              </Link>
            </>
          )}
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4">
          <p className="flex-1 text-graphite">Select your car to see only what fits it.</p>
          <ChooseCarButton />
        </div>
      )}

      <Listing
        base={showAll ? `${base}?all=1` : base}
        search={search}
        categoryIds={categoryIds}
        fit={showAll ? {} : carFit}
        badgeCar={car ? { variant_id: car.variantId, generation_id: car.generationId } : {}}
        carShort={short}
        label={`${category.name} products`}
        empty={
          <EmptyState title={`No ${category.name.toLowerCase()} for your car yet`} headingLevel={2}>
            We&apos;re adding more products every week.{" "}
            <Link href={`${base}?all=1`} className="font-semibold text-teal-600 underline">
              See all {category.name.toLowerCase()}
            </Link>
          </EmptyState>
        }
      />
    </>
  )
}
