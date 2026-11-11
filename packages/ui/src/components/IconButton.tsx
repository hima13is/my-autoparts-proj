import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn"

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Accessible name, e.g. "Open cart". Required: icon-only buttons have no visible text. */
  label: string
  icon: ReactNode
  variant?: "ghost" | "outline" | "solid" | "on-dark"
  /** Small count bubble, e.g. items in cart. Included in the accessible name. */
  count?: number
}

const variants = {
  ghost: "text-ink hover:bg-sand/60",
  outline: "border-2 border-ink bg-white text-ink hover:bg-cream",
  solid: "bg-ink text-white hover:bg-teal-600",
  "on-dark": "on-dark text-white hover:bg-white/10",
}

export function IconButton({
  label,
  icon,
  variant = "ghost",
  count,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  const name = count ? `${label} (${count} ${count === 1 ? "item" : "items"})` : label
  return (
    <button
      type={type}
      title={label}
      className={cn(
        "relative inline-flex size-tap shrink-0 items-center justify-center rounded-full transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...rest}
    >
      <span className="sr-only">{name}</span>
      <span aria-hidden className="[&>svg]:size-6">
        {icon}
      </span>
      {count ? (
        <span
          aria-hidden
          className="absolute right-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-marigold px-1 text-xs font-bold leading-5 text-charcoal"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  )
}
