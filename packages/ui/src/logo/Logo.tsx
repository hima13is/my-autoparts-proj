import { cn } from "../lib/cn"
import { wordmark } from "./paths"

const INK = "var(--color-ink)"
const CREAM = "var(--color-cream)"

export interface LogoProps {
  /** `light` = Ink letters for cream/white backgrounds; `dark` = cream letters for Ink backgrounds. */
  tone?: "light" | "dark"
  className?: string
  /** Accessible name. Pass "" when the logo sits inside a link that is already labelled. */
  title?: string
}

/** The "fitgaadi" wordmark: the dot of the "i" in *fit* is a check-tyre. */
export function Logo({ tone = "light", className, title = "fitgaadi" }: LogoProps) {
  const text = tone === "dark" ? CREAM : INK
  const { mark } = wordmark
  return (
    <svg
      viewBox={wordmark.viewBox}
      // Default height only when the caller passes none (two h-* classes would fight).
      className={cn("w-auto shrink-0", className ?? "h-7")}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d={wordmark.letters} fill={text} />
      <circle
        cx={mark.cx}
        cy={mark.cy}
        r={mark.r}
        fill="var(--color-marigold)"
        stroke={text}
        strokeWidth={mark.ring}
      />
      <path
        d={wordmark.check}
        fill="none"
        stroke={INK}
        strokeWidth={wordmark.checkWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** The square app icon / favicon mark. Decorative by default. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={cn("shrink-0", className ?? "size-8")}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <rect width="512" height="512" rx="112" fill={INK} />
      <circle
        cx="256"
        cy="256"
        r="127"
        fill="var(--color-marigold)"
        stroke={CREAM}
        strokeWidth="46"
      />
      <path
        d="M193 259L238 304L322 211"
        fill="none"
        stroke={INK}
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
