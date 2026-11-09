import { demoCategories, demoProducts, productImage } from "@autoparts/ui/fixtures"
import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Hero } from "@/prototype/hero"
import { ProductRail } from "@/prototype/product-grid"
import { P } from "@/prototype/shell"

export const metadata: Metadata = { title: "Home" }

export default function PrototypeHome() {
  return (
    <>
      <Hero />

      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 md:px-6">
        <section aria-labelledby="cats">
          <h2 id="cats" className="mb-4 font-heading text-2xl font-bold text-ink">
            Shop by category
          </h2>
          <ul className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {demoCategories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`${P}/c/${c.slug}`}
                  className="flex flex-col items-center gap-2 rounded-card border border-sand bg-white p-2 text-center text-sm font-semibold text-ink shadow-card hover:border-ink"
                >
                  <img
                    src={productImage(c.kind)}
                    alt=""
                    className="aspect-square w-full rounded-xl"
                  />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="best">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 id="best" className="font-heading text-2xl font-bold text-ink">
              Best sellers
            </h2>
            <Link
              href={`${P}/c/seat-covers`}
              className="inline-flex min-h-tap items-center gap-1 font-semibold text-teal-600"
            >
              See all <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <ProductRail label="Best sellers" products={demoProducts.slice(0, 4)} />
        </section>
      </div>
    </>
  )
}
