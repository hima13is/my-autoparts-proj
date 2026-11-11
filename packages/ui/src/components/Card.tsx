import type { ElementType, HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn"

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  padding?: "none" | "md" | "lg"
  children: ReactNode
}

const paddings = { none: "", md: "p-4", lg: "p-6" }

/** White surface with a Sand border on the cream page background. */
export function Card({ as: Tag = "div", padding = "md", className, children, ...rest }: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-sand bg-white shadow-card",
        paddings[padding],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
