import { LoaderCircle } from "lucide-react"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn"

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"
export type ButtonSize = "md" | "lg"

const variants: Record<ButtonVariant, string> = {
  // Marigold + Charcoal text: 8.7:1. Never white text on Marigold.
  primary: "bg-marigold text-charcoal hover:bg-marigold-600 active:bg-marigold-600",
  secondary: "bg-ink text-white hover:bg-teal-600",
  outline: "border-2 border-ink bg-white text-ink hover:bg-cream",
  ghost: "bg-transparent text-ink hover:bg-sand/60",
  danger: "bg-brick text-white hover:bg-[#9a1e14]",
}

const sizes: Record<ButtonSize, string> = {
  md: "min-h-tap px-5 text-base",
  lg: "min-h-12 px-6 text-lg",
}

/**
 * Classes for anything that should look like a button (e.g. a Next.js <Link>).
 * Every size is at least 44px tall (touch target).
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
} = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className
  )
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  /** Shows a spinner, keeps the label for screen readers and blocks clicks. */
  loading?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <LoaderCircle aria-hidden className="size-5 animate-spin" />
      ) : (
        leadingIcon && <span aria-hidden>{leadingIcon}</span>
      )}
      {children}
      {!loading && trailingIcon && <span aria-hidden>{trailingIcon}</span>}
    </button>
  )
}
