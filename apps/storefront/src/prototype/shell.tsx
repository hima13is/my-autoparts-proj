"use client"

import {
  CarChip,
  Footer,
  Header,
  Sheet,
  ToastProvider,
  VehicleSelectorSheet,
  vehicleLabel,
  vehicleShortLabel,
} from "@autoparts/ui"
import { demoCatalog, demoCategories } from "@autoparts/ui/fixtures"
import Link from "next/link"
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { cartCount, prototypeActions, usePrototypeState } from "./store"

interface CarApi {
  /** Full label, e.g. "Hyundai Creta 2021 SX Diesel" (undefined when no car is chosen). */
  label?: string
  /** Short label for badges, e.g. "Creta". */
  short?: string
  openSelector: () => void
}

const CarContext = createContext<CarApi | null>(null)

export function useCar(): CarApi {
  const ctx = useContext(CarContext)
  if (!ctx) throw new Error("useCar must be used inside <PrototypeShell>")
  return ctx
}

export const P = "/prototype"

const footerColumns = [
  {
    title: "Shop",
    links: demoCategories.slice(0, 4).map((c) => ({ label: c.name, href: `${P}/c/${c.slug}` })),
  },
  {
    title: "Help",
    links: [
      { label: "Cart", href: `${P}/cart` },
      { label: "Prototype home", href: P },
    ],
  },
  {
    title: "FitGaadi",
    links: [{ label: "Phase 0 status page", href: "/" }],
  },
]

export function PrototypeShell({ children }: { children: ReactNode }) {
  const state = usePrototypeState()
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const openSelector = useCallback(() => setSelectorOpen(true), [])
  const car = useMemo<CarApi>(
    () => ({
      label: state.car ? vehicleLabel(demoCatalog, state.car) : undefined,
      short: state.car ? vehicleShortLabel(demoCatalog, state.car) : undefined,
      openSelector,
    }),
    [state.car, openSelector]
  )

  return (
    <CarContext.Provider value={car}>
      <ToastProvider>
        <p className="bg-marigold px-4 py-1.5 text-center text-sm font-medium text-charcoal">
          Prototype with made-up products and prices. Nothing here can be bought.
        </p>
        <Header
          linkAs={Link}
          homeHref={P}
          cartHref={`${P}/cart`}
          accountHref={P}
          wishlistHref={P}
          searchAction={`${P}/c/seat-covers`}
          cartCount={cartCount(state)}
          onMenu={() => setMenuOpen(true)}
        >
          <CarChip label={car.label} onChange={openSelector} />
        </Header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <Footer linkAs={Link} columns={footerColumns} />

        <VehicleSelectorSheet
          catalog={demoCatalog}
          open={selectorOpen}
          onClose={() => setSelectorOpen(false)}
          onSelect={(v) => {
            prototypeActions.setCar(v)
            setSelectorOpen(false)
          }}
          onSkip={() => {
            prototypeActions.setCar(undefined)
            setSelectorOpen(false)
          }}
        />

        <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Shop by category">
          <nav aria-label="Categories">
            <ul className="flex flex-col">
              {demoCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`${P}/c/${c.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-tap items-center border-b border-sand py-2 font-semibold text-ink"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Sheet>
      </ToastProvider>
    </CarContext.Provider>
  )
}
