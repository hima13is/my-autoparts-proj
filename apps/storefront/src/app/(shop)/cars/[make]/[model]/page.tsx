import { Breadcrumb, EmptyState } from "@autoparts/ui"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { UseThisCarButton } from "@/components/car-actions"
import { Listing, ListingSkeleton } from "@/components/listing"
import { getVehicleCatalog } from "@/lib/vehicles"

async function findCar(makeSlug: string, modelSlug: string) {
  const catalog = await getVehicleCatalog()
  const make = catalog.makes.find((m) => m.slug === makeSlug)
  const model = make?.models.find((m) => m.slug === modelSlug)
  return make && model ? { make, model } : undefined
}

export async function generateMetadata({
  params,
}: PageProps<"/cars/[make]/[model]">): Promise<Metadata> {
  const { make, model } = await params
  const car = await findCar(make, model)
  if (!car) return { title: "Car not found · FitGaadi" }
  const name = `${car.make.name} ${car.model.name}`
  return {
    title: `${name} accessories that fit · FitGaadi`,
    description: `Seat covers, floor mats, sunshades and more made for the ${name}. Every item is checked against your exact year and variant.`,
    alternates: { canonical: `/cars/${make}/${model}` },
  }
}

export default function CarPage(props: PageProps<"/cars/[make]/[model]">) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-6">
      <Suspense fallback={<ListingSkeleton />}>
        <CarContent {...props} />
      </Suspense>
    </div>
  )
}

async function CarContent({ params, searchParams }: PageProps<"/cars/[make]/[model]">) {
  const [{ make: makeSlug, model: modelSlug }, search] = await Promise.all([params, searchParams])
  const car = await findCar(makeSlug, modelSlug)
  if (!car) notFound()
  const { make, model } = car
  const name = `${make.name} ${model.name}`
  const base = `/cars/${makeSlug}/${modelSlug}`

  if (model.years.length === 0) {
    return (
      <>
        <h1 className="font-heading text-3xl font-bold text-ink">{name} accessories</h1>
        <EmptyState title="Coming soon" headingLevel={2}>
          We haven&apos;t listed accessories for this car yet.
        </EmptyState>
      </>
    )
  }

  const askedYear = Number(Array.isArray(search.year) ? search.year[0] : search.year)
  const year = model.years.find((y) => y.year === askedYear) ?? model.years[0]
  const generationId = year.generationId
  const fit: Record<string, string> = generationId ? { fits_generation_id: generationId } : {}

  return (
    <>
      <Breadcrumb
        linkAs={Link}
        items={[{ label: "Home", href: "/" }, { label: make.name }, { label: model.name }]}
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-ink">{name} accessories</h1>
          <p className="mt-1 text-graphite">
            Showing what fits a {year.year} {model.name}. Pick your year:
          </p>
        </div>
        <UseThisCarButton makeId={make.id} modelId={model.id} year={year.year} name={model.name} />
      </div>

      <nav aria-label="Model year">
        <ul className="flex flex-wrap gap-2">
          {model.years.map((y) => {
            const current = y.year === year.year
            return (
              <li key={y.year}>
                <Link
                  href={`${base}?year=${y.year}`}
                  aria-current={current ? "true" : undefined}
                  scroll={false}
                  className={
                    current
                      ? "inline-flex min-h-tap items-center rounded-full border border-ink bg-ink px-4 text-sm font-semibold text-white"
                      : "inline-flex min-h-tap items-center rounded-full border border-sand bg-white px-4 text-sm font-semibold text-ink hover:border-ink"
                  }
                >
                  {y.year}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Listing
        base={`${base}?year=${year.year}`}
        search={search}
        fit={fit}
        badgeCar={generationId ? { generation_id: generationId } : {}}
        carShort={model.name}
        label={`Accessories for the ${year.year} ${name}`}
        empty={
          <EmptyState
            title={`No accessories for the ${year.year} ${model.name} yet`}
            headingLevel={2}
          >
            We&apos;re adding more products every week.
          </EmptyState>
        }
      />
    </>
  )
}
