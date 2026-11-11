import type { ReactNode } from "react"
import { cn } from "../lib/cn"

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  children?: ReactNode
  /** Usually a Button or a link styled with buttonClasses(). */
  action?: ReactNode
  headingLevel?: 2 | 3
  className?: string
}

/** Friendly "nothing here yet" message with a next step (empty cart, no results, 404). */
export function EmptyState({
  icon,
  title,
  children,
  action,
  headingLevel = 2,
  className,
}: EmptyStateProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3"
  return (
    <div
      className={cn(
        "mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-10 text-center",
        className
      )}
    >
      {icon && (
        <div
          aria-hidden
          className="grid size-16 place-items-center rounded-full bg-sand text-ink [&>svg]:size-8"
        >
          {icon}
        </div>
      )}
      <Heading className="font-heading text-xl font-bold text-ink">{title}</Heading>
      {children && <div className="text-graphite">{children}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
