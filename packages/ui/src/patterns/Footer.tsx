import type { ElementType } from "react"
import { cn } from "../lib/cn"
import { Logo } from "../logo/Logo"
import { TrustStrip } from "./TrustStrip"

export interface FooterProps {
  columns?: ReadonlyArray<{ title: string; links: ReadonlyArray<{ label: string; href: string }> }>
  linkAs?: ElementType
  className?: string
}

const defaultColumns: NonNullable<FooterProps["columns"]> = [
  {
    title: "Shop",
    links: [
      { label: "Seat covers", href: "/c/seat-covers" },
      { label: "Floor mats", href: "/c/floor-mats" },
      { label: "Dashcams", href: "/c/dashcams" },
      { label: "Car care", href: "/c/car-care" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track order", href: "/track" },
      { label: "Shipping", href: "/help/shipping" },
      { label: "Returns", href: "/help/returns" },
      { label: "Contact us", href: "/help/contact" },
    ],
  },
  {
    title: "FitGaadi",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Grievance officer", href: "/grievance" },
    ],
  },
]

export function Footer({ columns = defaultColumns, linkAs: Link = "a", className }: FooterProps) {
  return (
    <footer className={cn("on-dark bg-ink text-cream", className)}>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <TrustStrip tone="dark" className="border-b border-white/15 pb-8" />
        <div className="grid grid-cols-2 gap-8 pt-8 md:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <Logo tone="dark" className="h-7 self-start" />
            <p className="text-cream">Sahi fit. Seedha ghar.</p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-2 font-heading font-semibold text-white">{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-tap items-center text-cream hover:text-white hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-8 border-t border-white/15 pt-6 text-sm text-cream">
          © FitGaadi. All prices include GST.
        </p>
      </div>
    </footer>
  )
}
