import { ChevronRight } from "lucide-react"
import type { ElementType } from "react"
import { cn } from "../lib/cn"

export interface BreadcrumbProps {
  /** The last item is the current page (rendered as text with aria-current). */
  items: ReadonlyArray<{ label: string; href?: string }>
  linkAs?: ElementType
  className?: string
}

export function Breadcrumb({ items, linkAs: Link = "a", className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {last || !item.href ? (
                <span aria-current={last ? "page" : undefined} className="text-graphite">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex min-h-tap items-center text-teal-600 underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              )}
              {!last && <ChevronRight aria-hidden className="size-4 text-graphite" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
