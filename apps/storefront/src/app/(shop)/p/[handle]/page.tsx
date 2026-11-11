import { Accordion, Breadcrumb, Skeleton } from "@autoparts/ui"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { CAR_COOKIE, decodeCarCookie } from "@/lib/car-cookie"
import { getCategories, toCardProduct } from "@/lib/catalogue"
import { buyVariants, getProduct, getProductFit, yearRange, type FitCar } from "@/lib/product"
import { productImageFor } from "@/lib/product-image"
import { BuyBox, FitmentPanel } from "./product-panels"

export async function generateMetadata({ params }: PageProps<"/p/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle).catch(() => undefined)
  if (!product) return { title: "Product not found · FitGaadi" }
  return {
    title: `${product.title} · FitGaadi`,
    description: product.description ?? `${product.title}, checked against your exact car.`,
    alternates: { canonical: `/p/${product.handle}` },
  }
}

export default function ProductPage(props: PageProps<"/p/[handle]">) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 md:px-6">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent {...props} />
      </Suspense>
    </div>
  )
}

async function ProductContent({ params }: PageProps<"/p/[handle]">) {
  const { handle } = await params
  const [product, categories, jar] = await Promise.all([
    getProduct(handle),
    getCategories(),
    cookies(),
  ])
  if (!product) notFound()

  const car = decodeCarCookie(jar.get(CAR_COOKIE)?.value)
  const carParams = car?.variantId
    ? { variant_id: car.variantId }
    : car?.generationId
      ? { generation_id: car.generationId }
      : undefined
  const [list, check] = await Promise.all([
    getProductFit(product.id, {}),
    carParams ? getProductFit(product.id, carParams) : undefined,
  ])
  const universal = list.universal
  const cars = list.kind === "list" ? list.cars : []
  const verdict = universal
    ? "universal"
    : check?.kind === "check"
      ? check.fits
        ? "fits"
        : "no-fit"
      : "unknown"
  const notes = check?.kind === "check" ? check.notes : []

  const card = toCardProduct(product)
  const category = categories.find((c) => c.handle === card.categoryHandle)
  const image = product.images[0]?.url ?? productImageFor(card)

  return (
    <>
      <Breadcrumb
        linkAs={Link}
        items={[
          { label: "Home", href: "/" },
          ...(category ? [{ label: category.name, href: `/c/${category.handle}` }] : []),
          { label: product.title },
        ]}
      />

      <div className="mt-2 grid gap-6 md:grid-cols-2 md:gap-10">
        <section aria-label="Product images" className="md:sticky md:top-4 md:self-start">
          {/* eslint-disable-next-line @next/next/no-img-element -- placeholder art is a data URI */}
          <img
            src={image}
            alt={product.images[0] ? product.title : ""}
            className="aspect-square w-full rounded-card border border-sand"
          />
        </section>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {card.brand && (
              <p className="text-sm font-semibold uppercase tracking-wide text-graphite">
                {card.brand}
              </p>
            )}
            <h1 className="font-heading text-2xl font-bold leading-tight text-ink md:text-3xl">
              {product.title}
            </h1>
          </div>
          <FitmentPanel verdict={verdict} notes={notes} />
          <BuyBox variants={buyVariants(product)} />
          {product.description && <p className="max-w-prose">{product.description}</p>}

          <section aria-labelledby="fits-list">
            <h2 id="fits-list" className="mb-2 font-heading text-xl font-bold text-ink">
              Cars this fits
            </h2>
            {universal ? (
              <p>Every car. This is a universal accessory.</p>
            ) : cars.length ? (
              <FitList cars={cars} />
            ) : (
              <p>We haven&apos;t confirmed any cars for this product yet.</p>
            )}
          </section>

          <Accordion
            headingLevel={2}
            items={[
              {
                id: "returns",
                title: "Returns & fit guarantee",
                content: (
                  <p>
                    Doesn&apos;t fit the car you selected? Request a return within 7 days and
                    we&apos;ll pick it up for free.
                  </p>
                ),
              },
              {
                id: "shipping",
                title: "Delivery",
                content: (
                  <p>
                    Shipped by our partner supplier. Delivery dates by PIN code are coming soon.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </div>
    </>
  )
}

function FitList({ cars }: { cars: FitCar[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {cars.map((c, i) => (
        <li key={i}>
          <Link
            href={`/cars/${c.make_slug}/${c.model_slug}?year=${c.year_to ?? c.year_from}`}
            className="font-semibold text-teal-600 underline underline-offset-4"
          >
            {c.make} {c.model} {yearRange(c.year_from, c.year_to)}
          </Link>
          {c.variant && <span className="text-graphite"> · {c.variant} only</span>}
        </li>
      ))}
    </ul>
  )
}

function ProductSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2" aria-busy="true" aria-label="Loading product">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-1/2" />
      </div>
    </div>
  )
}
