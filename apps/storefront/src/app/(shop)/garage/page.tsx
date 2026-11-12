import type { Metadata } from "next"
import { GarageView } from "./garage-view"

export const metadata: Metadata = {
  title: "My Garage · FitGaadi",
  description: "Your saved cars. Pick one to see accessories that fit it.",
  robots: { index: false, follow: true },
}

export default function GaragePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-ink">My Garage</h1>
      <p className="mt-2 text-graphite">
        Cars you have picked on this device. We show accessories that fit the selected car.
      </p>
      <GarageView />
    </div>
  )
}
