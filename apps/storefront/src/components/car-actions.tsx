"use client"

import { Badge, Button } from "@autoparts/ui"
import { CarFront } from "lucide-react"
import { useCar } from "@/components/site-shell"
import { selectCar, withGeneration } from "@/lib/garage"
import { updateGarage } from "@/lib/garage-store"

/** Opens the vehicle selector (used in "Select your car to see what fits" prompts). */
export function ChooseCarButton({ label = "Select your car" }: { label?: string }) {
  const { openSelector } = useCar()
  return (
    <Button onClick={openSelector} leadingIcon={<CarFront className="size-5" aria-hidden />}>
      {label}
    </Button>
  )
}

/** On a car page: make this car (any variant) the shopper's car. */
export function UseThisCarButton({
  makeId,
  modelId,
  year,
  name,
}: {
  makeId: string
  modelId: string
  year: number
  name: string
}) {
  const { catalog, car } = useCar()
  const selected = car && car.modelId === modelId && car.year === year
  if (selected) return <Badge tone="fits">This is your car</Badge>
  return (
    <Button
      variant="secondary"
      onClick={() =>
        updateGarage((s) => selectCar(s, withGeneration(catalog, { makeId, modelId, year })))
      }
      leadingIcon={<CarFront className="size-5" aria-hidden />}
    >
      Set {name} {year} as my car
    </Button>
  )
}
