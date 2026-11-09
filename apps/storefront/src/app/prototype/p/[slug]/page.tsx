import { Accordion, Breadcrumb, PriceBlock, Rating, Tabs } from "@autoparts/ui"
import { demoCategories, demoProducts, productImage } from "@autoparts/ui/fixtures"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BuyBox, FitmentPanel } from "@/prototype/buy-box"
import { P } from "@/prototype/shell"

export function generateStaticParams() {
  return demoProducts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/prototype/p/[slug]">): Promise<Metadata> {
  const { slug } = await params
  return { title: demoProducts.find((p) => p.slug === slug)?.title ?? "Product" }
}

export default async function ProductPage({ params }: PageProps<"/prototype/p/[slug]">) {
  const { slug } = await params
  const product = demoProducts.find((p) => p.slug === slug)
  if (!product) notFound()
  const category = demoCategories.find((c) => c.slug === product.category)
  const image = productImage(product.kind)

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-4 md:px-6 md:pb-12">
      <Breadcrumb
        linkAs={Link}
        items={[
          { label: "Home", href: P },
          ...(category ? [{ label: category.name, href: `${P}/c/${category.slug}` }] : []),
          { label: product.title },
        ]}
      />

      <div className="mt-2 grid gap-6 md:grid-cols-2 md:gap-10">
        <section
          aria-label="Product images"
          className="flex flex-col gap-3 md:sticky md:top-4 md:self-start"
        >
          <img
            src={image}
            alt={product.alt}
            className="aspect-square w-full rounded-card border border-sand"
          />
          <ul className="grid grid-cols-4 gap-2" aria-label="More images (demo)">
            {[0, 1, 2, 3].map((i) => (
              <li key={i}>
                <img
                  src={image}
                  alt=""
                  className={`aspect-square w-full rounded-xl border-2 ${i === 0 ? "border-ink" : "border-sand opacity-70"}`}
                />
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-graphite">
              {product.brand}
            </p>
            <h1 className="font-heading text-2xl font-bold leading-tight text-ink md:text-3xl">
              {product.title}
            </h1>
            <Rating value={product.rating.value} count={product.rating.count} size="md" />
          </div>
          <PriceBlock price={product.price} mrp={product.mrp} size="lg" showTaxNote />
          <FitmentPanel product={product} />
          <BuyBox product={product} />

          <Tabs
            label="Product information"
            items={[
              {
                id: "highlights",
                label: "Highlights",
                content: (
                  <ul className="list-disc space-y-1 pl-5">
                    {product.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                ),
              },
              {
                id: "specs",
                label: "Specifications",
                content: (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                    <dt className="text-graphite">Brand</dt>
                    <dd>{product.brand}</dd>
                    <dt className="text-graphite">SKU</dt>
                    <dd className="font-mono">FG-{product.slug.slice(0, 10).toUpperCase()}</dd>
                    <dt className="text-graphite">Warranty</dt>
                    <dd>6 months</dd>
                  </dl>
                ),
              },
              {
                id: "box",
                label: "In the box",
                content: <p>1 × {product.title}, fitting guide.</p>,
              },
            ]}
          />

          <Accordion
            headingLevel={2}
            items={[
              {
                id: "returns",
                title: "Returns & fit guarantee",
                content: (
                  <p>
                    Doesn&apos;t fit? Request a return within 7 days and we&apos;ll pick it up for
                    free.
                  </p>
                ),
              },
              {
                id: "reviews",
                title: `Reviews (${product.rating.count.toLocaleString("en-IN")})`,
                content: <p>Reviews from verified buyers arrive in Build Phase 2.</p>,
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
