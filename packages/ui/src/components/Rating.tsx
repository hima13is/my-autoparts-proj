import { Star } from "lucide-react"
import { cn } from "../lib/cn"

export interface RatingProps {
  /** 0–5, one decimal place. */
  value: number
  count?: number
  size?: "sm" | "md"
  className?: string
}

export function ratingLabel(value: number, count?: number): string {
  const base = `Rated ${value.toFixed(1)} out of 5`
  if (count === undefined) return base
  return `${base}, ${count.toLocaleString("en-IN")} ${count === 1 ? "review" : "reviews"}`
}

/** Read-only star rating. Screen readers get one sentence; the stars are decorative. */
export function Rating({ value, count, size = "sm", className }: RatingProps) {
  const clamped = Math.max(0, Math.min(5, value))
  const star = size === "md" ? "size-5" : "size-4"
  return (
    <p className={cn("flex items-center gap-1.5", className)}>
      <span className="sr-only">{ratingLabel(clamped, count)}</span>
      <span aria-hidden className="relative inline-flex">
        <span className="flex text-sand">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={cn(star, "fill-current")} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden text-amber-ink"
          style={{ width: `${(clamped / 5) * 100}%` }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={cn(star, "shrink-0 fill-current")} />
          ))}
        </span>
      </span>
      <span aria-hidden className={cn("text-graphite", size === "md" ? "text-base" : "text-sm")}>
        {clamped.toFixed(1)}
        {count !== undefined && ` (${count.toLocaleString("en-IN")})`}
      </span>
    </p>
  )
}
