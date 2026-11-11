"use client"

import { Button, Card, FitBadge, PriceBlock, RadioGroup } from "@autoparts/ui"
import { ShoppingCart } from "lucide-react"
import { useState } from "react"
import { useCar } from "@/components/site-shell"
import type { BuyVariant } from "@/lib/product"

/**
 * The fit verdict is worked out on the server for the car in the cookie; this panel shows
 * it and lets the shopper pick another car (the page then re-renders for that car).
 */
export function FitmentPanel({
  verdict,
  notes,
}: {
  verdict: "fits" | "universal" | "no-fit" | "unknown"
  notes: string[]
}) {
  const { label, short, openSelector } = useCar()
  const hasCar = Boolean(label) && verdict !== "unknown"
  return (
    <Card as="section" aria-labelledby="fitment-title" padding="md" className="flex flex-col gap-3">
      <h2 id="fitment-title" className="font-heading text-lg font-bold text-ink">
        Will it fit?
      </h2>
      {verdict === "universal" ? (
        <>
          <FitBadge status="universal" />
          <p>This fits every car{label ? `, including your ${label}` : ""}.</p>
        </>
      ) : hasCar ? (
        <>
          <FitBadge status={verdict} car={short} />
          <p role="status">
            {verdict === "fits"
              ? `Yes, this fits your ${label}.`
              : `No, this doesn't fit your ${label}. Check the list below for the cars it fits.`}
          </p>
        </>
      ) : (
        <p>Select your car and we&apos;ll tell you if this fits.</p>
      )}
      {notes.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-graphite">
          {notes.map((n) => (
            <li key={n}>Fitting note: {n}</li>
          ))}
        </ul>
      )}
      <Button variant="secondary" onClick={openSelector} className="self-start">
        {label ? "Check another car" : "Select your car"}
      </Button>
    </Card>
  )
}

/** Colour choice and price. Buying opens with carts and checkout in Build Phase 3. */
export function BuyBox({ variants }: { variants: BuyVariant[] }) {
  const [id, setId] = useState(variants[0]?.id)
  const chosen = variants.find((v) => v.id === id) ?? variants[0]
  if (!chosen) return <p className="text-graphite">Currently unavailable.</p>

  return (
    <div className="flex flex-col gap-5">
      <PriceBlock price={chosen.price} mrp={chosen.mrp} size="lg" showTaxNote />
      {variants.length > 1 && (
        <RadioGroup
          legend="Colour"
          name="variant"
          value={id}
          onChange={setId}
          options={variants.map((v) => ({ value: v.id, label: v.title }))}
        />
      )}
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          fullWidth
          disabled
          aria-describedby="buy-soon"
          leadingIcon={<ShoppingCart className="size-5" aria-hidden />}
        >
          Add to cart
        </Button>
        <p id="buy-soon" className="text-sm text-graphite">
          Online ordering opens soon. You can already check fit and prices.
        </p>
      </div>
    </div>
  )
}
