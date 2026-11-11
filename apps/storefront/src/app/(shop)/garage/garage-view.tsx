"use client"

import { Badge, Button, EmptyState, vehicleLabel } from "@autoparts/ui"
import { CarFront, Plus, Trash2 } from "lucide-react"
import { useSyncExternalStore } from "react"
import { useCar } from "@/components/site-shell"
import { removeCar, sameCar, selectCar } from "@/lib/garage"
import { updateGarage, useGarage } from "@/lib/garage-store"

const subscribeNoop = () => () => {}

export function GarageView() {
  const { catalog, openSelector } = useCar()
  const garage = useGarage()
  // The garage lives in this browser only, so show nothing until hydrated.
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )
  if (!hydrated) return null

  if (garage.saved.length === 0) {
    return (
      <EmptyState
        className="mt-8"
        icon={<CarFront className="size-8" aria-hidden />}
        title="No cars yet"
        headingLevel={2}
        action={
          <Button onClick={openSelector} leadingIcon={<Plus className="size-5" aria-hidden />}>
            Add a car
          </Button>
        }
      >
        Add your car to see only accessories that fit it.
      </EmptyState>
    )
  }

  return (
    <>
      <ul className="mt-6 flex flex-col gap-3" aria-label="Saved cars">
        {garage.saved.map((car) => {
          const label = vehicleLabel(catalog, car)
          const isCurrent = garage.current ? sameCar(garage.current, car) : false
          return (
            <li
              key={`${car.modelId}-${car.year}-${car.variantId ?? "any"}`}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-sand bg-white p-4"
            >
              <CarFront className="size-6 shrink-0 text-ink" aria-hidden />
              <p className="min-w-0 flex-1 font-semibold text-ink">
                {label}
                {!car.variantId && (
                  <span className="block text-sm font-normal text-graphite">Any variant</span>
                )}
              </p>
              {isCurrent ? (
                <Badge tone="fits">Selected</Badge>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => updateGarage((s) => selectCar(s, car))}
                  aria-label={`Shop for this car: ${label}`}
                >
                  Shop for this car
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => updateGarage((s) => removeCar(s, car))}
                leadingIcon={<Trash2 className="size-4" aria-hidden />}
                aria-label={`Remove ${label}`}
              >
                Remove
              </Button>
            </li>
          )
        })}
      </ul>
      <Button
        className="mt-6"
        variant="secondary"
        onClick={openSelector}
        leadingIcon={<Plus className="size-5" aria-hidden />}
      >
        Add another car
      </Button>
    </>
  )
}
