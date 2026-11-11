import { BadgeIndianRupee, ReceiptText, RotateCcw } from "lucide-react"
import { cn } from "../lib/cn"

const items = [
  { icon: BadgeIndianRupee, title: "Cash on delivery", text: "Pay when it arrives" },
  { icon: RotateCcw, title: "7-day returns", text: "Free pickup if it doesn't fit" },
  { icon: ReceiptText, title: "GST invoice", text: "On every order" },
]

/** The three promises shown on the home page, product page and checkout. */
export function TrustStrip({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark"
  className?: string
}) {
  const dark = tone === "dark"
  return (
    <ul className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}>
      {items.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full",
              dark ? "bg-white/10 text-marigold" : "bg-sand text-ink"
            )}
          >
            <Icon className="size-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className={cn("font-semibold", dark ? "text-white" : "text-ink")}>{title}</span>
            <span className={cn("text-sm", dark ? "text-cream" : "text-graphite")}>{text}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
