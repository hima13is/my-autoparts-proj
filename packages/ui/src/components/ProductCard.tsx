import { Truck } from "lucide-react"
import type { ElementType } from "react"
import { cn } from "../lib/cn"
import { FitBadge, type FitStatus } from "./Badge"
import { PriceBlock } from "./PriceBlock"
import { Rating } from "./Rating"

export interface ProductCardProps {
  href: string
  title: string
  brand?: string
  image: { src: string; alt: string }
  price: number
  mrp?: number
  rating?: { value: number; count: number }
  fit?: { status: FitStatus; car?: string }
  /** e.g. "Get it Thu, 12 Nov". */
  delivery?: string
  /** Render links with your router (e.g. Next.js `Link`). Defaults to <a>. */
  linkAs?: ElementType
  className?: string
}

/**
 * Product tile for grids and rails. The title is the only link (keyboard users
 * tab once per card); a pseudo-element stretches it over the whole card.
 */
export function ProductCard({
  href,
  title,
  brand,
  image,
  price,
  mrp,
  rating,
  fit,
  delivery,
  linkAs: Link = "a",
  className,
}: ProductCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-sand bg-white shadow-card",
        "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-ink",
        className
      )}
    >
      <div className="aspect-square overflow-hidden bg-cream">
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {brand && (
          <p className="text-xs font-semibold uppercase tracking-wide text-graphite">{brand}</p>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-charcoal sm:text-base">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
        </h3>
        {rating && <Rating value={rating.value} count={rating.count} />}
        <PriceBlock price={price} mrp={mrp} />
        <div className="mt-auto flex flex-col gap-1.5 pt-1">
          {fit && <FitBadge status={fit.status} car={fit.car} />}
          {delivery && (
            <p className="flex items-center gap-1 text-sm text-graphite">
              <Truck aria-hidden className="size-4" />
              {delivery}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
