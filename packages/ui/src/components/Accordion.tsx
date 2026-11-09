import { ChevronDown } from "lucide-react"
import { useId, type ReactNode } from "react"
import { cn } from "../lib/cn"

export interface AccordionItem {
  id: string
  title: string
  content: ReactNode
  defaultOpen?: boolean
}

export interface AccordionProps {
  items: ReadonlyArray<AccordionItem>
  /** Only one section open at a time (uses the native `name` grouping on <details>). */
  exclusive?: boolean
  /** Heading level wrapping each summary, so sections show up in the page outline. */
  headingLevel?: 2 | 3 | 4
  className?: string
}

/** Native <details>/<summary>: keyboard and screen-reader support with no JavaScript. */
export function Accordion({
  items,
  exclusive = false,
  headingLevel = 3,
  className,
}: AccordionProps) {
  const id = useId()
  const group = exclusive ? `accordion-${id}` : undefined
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4"
  return (
    <div className={cn("divide-y divide-sand rounded-card border border-sand bg-white", className)}>
      {items.map((item) => (
        <details key={item.id} name={group} open={item.defaultOpen} className="group">
          <summary
            className={cn(
              "flex min-h-tap cursor-pointer list-none items-center justify-between gap-3 px-4 py-3",
              "[&::-webkit-details-marker]:hidden"
            )}
          >
            <Heading className="text-base font-semibold text-ink">{item.title}</Heading>
            <ChevronDown
              aria-hidden
              className="size-5 shrink-0 text-ink transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="px-4 pb-4 text-charcoal">{item.content}</div>
        </details>
      ))}
    </div>
  )
}
