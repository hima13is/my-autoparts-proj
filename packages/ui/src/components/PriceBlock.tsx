import { discountPercent, formatINR } from "@autoparts/shared"
import { cn } from "../lib/cn"

export interface PriceBlockProps {
  /** Selling price in rupees (incl. GST). */
  price: number
  /** Maximum retail price in rupees; shown struck through when higher than the price. */
  mrp?: number
  size?: "sm" | "lg"
  /** Show the "Incl. GST" line (product page). */
  showTaxNote?: boolean
  className?: string
}

export function PriceBlock({
  price,
  mrp,
  size = "sm",
  showTaxNote = false,
  className,
}: PriceBlockProps) {
  const off = mrp ? discountPercent(mrp, price) : 0
  return (
    <div className={cn("flex flex-col", className)}>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className={cn("font-bold text-charcoal", size === "lg" ? "text-3xl" : "text-lg")}>
          <span className="sr-only">Price </span>
          {formatINR(price)}
        </span>
        {off > 0 && mrp && (
          <>
            <s className={cn("text-graphite", size === "lg" ? "text-lg" : "text-sm")}>
              <span className="sr-only">MRP </span>
              {formatINR(mrp)}
            </s>
            <span className={cn("font-semibold text-fit", size === "lg" ? "text-lg" : "text-sm")}>
              {off}% off
            </span>
          </>
        )}
      </p>
      {showTaxNote && <p className="text-sm text-graphite">Incl. of all taxes (GST)</p>}
    </div>
  )
}
