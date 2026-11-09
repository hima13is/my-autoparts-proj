import { Breadcrumb, Pagination } from "@autoparts/ui"
import { demoCategories, demoProducts } from "@autoparts/ui/fixtures"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FilterBar } from "@/prototype/filters"
import { ProductGrid } from "@/prototype/product-grid"
import { P } from "@/prototype/shell"

export function generateStaticParams() {
  return demoCategories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/prototype/c/[slug]">): Promise<Metadata> {
  const { slug } = await params
  return { title: demoCategories.find((c) => c.slug === slug)?.name ?? "Category" }
}

export default async function CategoryPage({ params }: PageProps<"/prototype/c/[slug]">) {
  const { slug } = await params
  const category = demoCategories.find((c) => c.slug === slug)
  if (!category) notFound()

  // Demo: show this category first, then everything else, so every page has a full grid.
  const products = [
    ...demoProducts.filter((p) => p.category === slug),
    ...demoProducts.filter((p) => p.category !== slug),
  ]

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-6">
      <Breadcrumb
        linkAs={Link}
        items={[
          { label: "Home", href: P },
          { label: "Interior", href: P },
          { label: category.name },
        ]}
      />
      <h1 className="font-heading text-3xl font-bold text-ink">{category.name}</h1>
      <FilterBar resultCount={products.length} />
      <ProductGrid products={products} />
      <Pagination
        linkAs={Link}
        current={1}
        total={3}
        href={(p) => `${P}/c/${slug}?page=${p}`}
        className="py-4"
      />
    </div>
  )
}
