import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ElementType } from "react"
import { cn } from "../lib/cn"

/**
 * Page numbers to show: always first, last, current and its neighbours, with
 * "…" for gaps. e.g. (6, 12) → [1, "…", 5, 6, 7, "…", 12]
 */
export function pageRange(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current - 1, current, current + 1])
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p))
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p))
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: Array<number | "…"> = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…")
    out.push(p)
  })
  return out
}

export interface PaginationProps {
  current: number
  total: number
  /** Build the URL for a page, e.g. (p) => `?page=${p}`. Pages are real links (crawlable). */
  href: (page: number) => string
  linkAs?: ElementType
  className?: string
}

const cell =
  "inline-flex min-h-tap min-w-tap items-center justify-center rounded-xl px-3 font-semibold"

export function Pagination({
  current,
  total,
  href,
  linkAs: Link = "a",
  className,
}: PaginationProps) {
  if (total <= 1) return null
  return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          {current > 1 ? (
            <Link href={href(current - 1)} className={cn(cell, "gap-1 text-ink hover:bg-sand/60")}>
              <ChevronLeft aria-hidden className="size-5" />
              <span>Previous</span>
            </Link>
          ) : null}
        </li>
        {pageRange(current, total).map((p, i) => (
          <li key={`${p}-${i}`}>
            {p === "…" ? (
              <span aria-hidden className={cn(cell, "text-graphite")}>
                …
              </span>
            ) : p === current ? (
              <span aria-current="page" className={cn(cell, "bg-ink text-white")}>
                <span className="sr-only">Page </span>
                {p}
              </span>
            ) : (
              <Link href={href(p)} className={cn(cell, "text-ink hover:bg-sand/60")}>
                <span className="sr-only">Page </span>
                {p}
              </Link>
            )}
          </li>
        ))}
        <li>
          {current < total ? (
            <Link href={href(current + 1)} className={cn(cell, "gap-1 text-ink hover:bg-sand/60")}>
              <span>Next</span>
              <ChevronRight aria-hidden className="size-5" />
            </Link>
          ) : null}
        </li>
      </ul>
    </nav>
  )
}
