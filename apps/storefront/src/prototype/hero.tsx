"use client"

import { Button, VehicleSelectorForm } from "@autoparts/ui"
import { demoCatalog } from "@autoparts/ui/fixtures"
import { CarFront } from "lucide-react"
import { useRouter } from "next/navigation"
import { P, useCar } from "./shell"
import { prototypeActions } from "./store"

/** Home hero: pick the car, or (when one is saved) confirm it and jump to shopping. */
export function Hero() {
  const { label, openSelector } = useCar()
  const router = useRouter()

  return (
    <section aria-labelledby="hero-title" className="bg-ink">
      <div className="on-dark mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-2 md:items-center md:px-6 md:py-14">
        <div className="flex flex-col gap-3 text-white">
          <h1 id="hero-title" className="font-heading text-3xl font-bold leading-tight md:text-5xl">
            Find accessories that <span className="text-marigold">fit</span> your car
          </h1>
          <p className="max-w-md text-lg text-cream">
            Pick your car once. We only show what fits it, with a 7-day fit guarantee.
          </p>
        </div>
        <div className="rounded-card bg-white p-5 shadow-sheet">
          {label ? (
            <div className="flex flex-col gap-4">
              <p className="flex items-start gap-3">
                <CarFront aria-hidden className="mt-0.5 size-6 shrink-0 text-ink" />
                <span>
                  Shopping for <strong className="text-ink">{label}</strong>
                </span>
              </p>
              <Button size="lg" fullWidth onClick={() => router.push(`${P}/c/seat-covers`)}>
                Shop seat covers for my car
              </Button>
              <Button variant="outline" fullWidth onClick={openSelector}>
                Change car
              </Button>
            </div>
          ) : (
            <>
              <h2 className="mb-3 font-heading text-xl font-bold text-ink">Select your car</h2>
              <VehicleSelectorForm
                catalog={demoCatalog}
                onSubmit={(v) => {
                  prototypeActions.setCar(v)
                  router.push(`${P}/c/seat-covers`)
                }}
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}
