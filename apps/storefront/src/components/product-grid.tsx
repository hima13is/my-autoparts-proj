import { ProductCard, type FitStatus } from "@autoparts/ui"
import Link from "next/link"
import type { CardProduct } from "@/lib/catalogue"
import { productImageFor } from "@/lib/product-image"

export function ProductGrid({
  products,
  fit,
  carShort,
  label,
}: {
  products: CardProduct[]
  fit: Record<string, FitStatus>
  /** "Creta", for "Fits Creta" badges. */
  carShort?: string
  label: string
}) {
  return (
    <ul aria-label={label} className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => {
        const status = fit[p.id] ?? "unknown"
        return (
          <li key={p.id}>
            <ProductCard
              linkAs={Link}
              href={`/p/${p.handle}`}
              title={p.title}
              brand={p.brand}
              image={{ src: productImageFor(p), alt: "" }}
              price={p.price}
              mrp={p.mrp}
              fit={{ status, car: status === "fits" || status === "no-fit" ? carShort : undefined }}
            />
          </li>
        )
      })}
    </ul>
  )
}
