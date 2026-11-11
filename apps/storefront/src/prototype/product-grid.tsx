"use client"

import { ProductCard } from "@autoparts/ui"
import { productImage, type DemoProduct } from "@autoparts/ui/fixtures"
import Link from "next/link"
import { P, useCar } from "./shell"

/** Fit status depends on the shopper's car, so cards render on the client. */
function useFit(p: DemoProduct) {
  const { short } = useCar()
  // Without a car we can't promise anything: ask the shopper to check.
  return short ? { status: p.fit, car: short } : { status: "unknown" as const }
}

function Card({ p }: { p: DemoProduct }) {
  const fit = useFit(p)
  return (
    <ProductCard
      linkAs={Link}
      href={`${P}/p/${p.slug}`}
      title={p.title}
      brand={p.brand}
      image={{ src: productImage(p.kind), alt: p.alt }}
      price={p.price}
      mrp={p.mrp}
      rating={p.rating}
      fit={fit}
      delivery={p.delivery}
    />
  )
}

export function ProductGrid({ products }: { products: DemoProduct[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <li key={p.slug}>
          <Card p={p} />
        </li>
      ))}
    </ul>
  )
}

export function ProductRail({ products, label }: { products: DemoProduct[]; label: string }) {
  return (
    <ul
      aria-label={label}
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0"
    >
      {products.map((p) => (
        <li key={p.slug} className="w-44 shrink-0 snap-start md:w-auto">
          <Card p={p} />
        </li>
      ))}
    </ul>
  )
}
