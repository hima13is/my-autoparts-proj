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
  type VehicleCatalog,
} from "@autoparts/ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { CAR_COOKIE, encodeCarCookie, writeCarCookie } from "@/lib/car-cookie"
import { clearCurrent, pruneGarage, selectCar, withGeneration, type GarageCar } from "@/lib/garage"
import { updateGarage, useGarage } from "@/lib/garage-store"

interface CarApi {
  catalog: VehicleCatalog
  /** The shopper's car (undefined when browsing without one). */
  car?: GarageCar
  /** "Hyundai Creta 2021 SX(O)". */
  label?: string
  /** "Creta", for badges like "Fits Creta". */
  short?: string
  openSelector: () => void
}

const CarContext = createContext<CarApi | null>(null)

export function useCar(): CarApi {
  const ctx = useContext(CarContext)
  if (!ctx) throw new Error("useCar must be used inside <SiteShell>")
  return ctx
}

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "Seat covers", href: "/c/seat-covers" },
      { label: "Floor mats", href: "/c/floor-mats" },
      { label: "Dashcams", href: "/c/dashcams" },
      { label: "My Garage", href: "/garage" },
    ],
  },
  {
    title: "FitGaadi",
    links: [{ label: "Clickable prototype", href: "/prototype" }],
  },
]

export function SiteShell({ catalog, children }: { catalog: VehicleCatalog; children: ReactNode }) {
  const garage = useGarage()
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const openSelector = useCallback(() => setSelectorOpen(true), [])

  // Mirror the current car into a cookie so server-rendered grids filter for it, and
  // re-render them whenever it changes (also on first visit after a reload).
  const router = useRouter()
  useEffect(() => {
    const wanted = encodeCarCookie(garage.current)
    const match = document.cookie.match(new RegExp(`(?:^|; )${CAR_COOKIE}=([^;]*)`))
    if ((match?.[1] ?? "") === wanted) return
    writeCarCookie(garage.current)
    router.refresh()
  }, [garage, router])

  // Forget cars that were removed from the catalogue since they were saved.
  useEffect(() => {
    if (catalog.makes.length) updateGarage((s) => pruneGarage(s, catalog))
  }, [catalog])

  const api = useMemo<CarApi>(() => {
    const car = garage.current
    return {
      catalog,
      car,
      label: car ? vehicleLabel(catalog, car) || undefined : undefined,
      short: car ? vehicleShortLabel(catalog, car) || undefined : undefined,
      openSelector,
    }
  }, [catalog, garage, openSelector])

  return (
    <CarContext.Provider value={api}>
      <ToastProvider>
        <Header
          linkAs={Link}
          homeHref="/"
          cartHref="/cart"
          accountHref="/garage"
          wishlistHref="/garage"
          searchAction="/search"
          onMenu={() => setMenuOpen(true)}
        >
          <CarChip label={api.label} onChange={openSelector} />
        </Header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <Footer linkAs={Link} columns={footerColumns} />

        <VehicleSelectorSheet
          catalog={catalog}
          open={selectorOpen}
          onClose={() => setSelectorOpen(false)}
          onSelect={(v) => {
            updateGarage((s) => selectCar(s, withGeneration(catalog, v)))
            setSelectorOpen(false)
          }}
          onSkip={() => {
            updateGarage(clearCurrent)
            setSelectorOpen(false)
          }}
        />

        <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
          <nav aria-label="Main">
            <ul className="flex flex-col">
              <li>
                <Link
                  href="/garage"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-tap items-center border-b border-sand py-2 font-semibold text-ink"
                >
                  My Garage
                </Link>
              </li>
            </ul>
          </nav>
        </Sheet>
      </ToastProvider>
    </CarContext.Provider>
  )
}
