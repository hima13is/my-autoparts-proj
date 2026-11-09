import { CircleAlert, CircleCheck, CircleX } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "../lib/cn"

export type BadgeTone = "fits" | "no-fit" | "check" | "neutral" | "info" | "offer"

// Solid fills only: brand colours on their own 10% tint fail AA (e.g. fit on fit/10 = 4.39:1).
const tones: Record<BadgeTone, string> = {
  fits: "bg-fit text-white",
  "no-fit": "bg-brick text-white",
  check: "bg-amber-ink text-white",
  neutral: "bg-sand text-charcoal",
  info: "bg-ink text-white",
  offer: "bg-marigold text-charcoal",
}

export interface BadgeProps {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function Badge({ tone = "neutral", icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-semibold leading-6",
        tones[tone],
        className
      )}
    >
      {icon && (
        <span aria-hidden className="[&>svg]:size-4">
          {icon}
        </span>
      )}
      {children}
    </span>
  )
}

export type FitStatus = "fits" | "no-fit" | "unknown"

export interface FitBadgeProps {
  status: FitStatus
  /** Short car name, e.g. "Creta". Without a car the badge asks the shopper to check. */
  car?: string
  className?: string
}

/** The core FitGaadi promise, shown on cards, product pages and the cart. */
export function FitBadge({ status, car, className }: FitBadgeProps) {
  if (status === "fits") {
    return (
      <Badge tone="fits" icon={<CircleCheck />} className={className}>
        Fits {car ?? "your car"}
      </Badge>
    )
  }
  if (status === "no-fit") {
    return (
      <Badge tone="no-fit" icon={<CircleX />} className={className}>
        Doesn&apos;t fit {car ?? "your car"}
      </Badge>
    )
  }
  return (
    <Badge tone="check" icon={<CircleAlert />} className={className}>
      Check fitment
    </Badge>
  )
}
