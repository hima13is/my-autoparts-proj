"use client"

import { Button, Card, FitBadge, Input, PriceBlock, RadioGroup, useToast } from "@autoparts/ui"
import type { DemoProduct } from "@autoparts/ui/fixtures"
import { ShoppingCart, Truck } from "lucide-react"
import Link from "next/link"
import { useState, type FormEvent } from "react"
import { P, useCar } from "./shell"
import { prototypeActions } from "./store"

/** Fitment panel: the core of the product page. */
export function FitmentPanel({ product }: { product: DemoProduct }) {
  const { label, short, openSelector } = useCar()
  return (
    <Card as="section" aria-labelledby="fitment-title" padding="md" className="flex flex-col gap-3">
      <h2 id="fitment-title" className="font-heading text-lg font-bold text-ink">
        Fitment
      </h2>
      {label ? (
        <>
          <FitBadge status={product.fit} car={short} />
          <p>
            {product.fit === "fits"
              ? `Fits your ${label}.`
              : product.fit === "no-fit"
                ? `Doesn't fit your ${label}. See items that do in the category list.`
                : `We haven't confirmed this for your ${label} yet.`}
          </p>
          {product.fitNote && <p className="text-sm text-graphite">Note: {product.fitNote}</p>}
        </>
      ) : (
        <p>Select your car to check if this fits.</p>
      )}
      <Button variant="secondary" onClick={openSelector} className="self-start">
        {label ? "Check another car" : "Select your car"}
      </Button>
    </Card>
  )
}

/** Colour, PIN-code delivery check and Add to cart (sticky on phones). */
export function BuyBox({ product }: { product: DemoProduct }) {
  const toast = useToast()
  const [colour, setColour] = useState(product.colours?.[0])
  const [pin, setPin] = useState("")
  const [pinError, setPinError] = useState<string>()
  const [delivery, setDelivery] = useState<string>()

  const checkPin = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setDelivery(undefined)
      setPinError("Enter a valid 6-digit PIN code.")
      return
    }
    setPinError(undefined)
    setDelivery(`${product.delivery.replace("Get it", "Get it by")} · Cash on delivery available`)
  }

  const add = () => {
    prototypeActions.addToCart(product.slug, colour)
    toast.show("Added to cart", {
      action: (
        <Link
          href={`${P}/cart`}
          className="min-h-tap content-center rounded-lg px-2 font-semibold text-marigold underline"
        >
          View cart
        </Link>
      ),
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {product.colours && (
        <RadioGroup
          legend="Colour"
          name="colour"
          value={colour}
          onChange={setColour}
          options={product.colours.map((c) => ({ value: c, label: c }))}
        />
      )}

      <form onSubmit={checkPin} className="flex items-start gap-2" aria-label="Check delivery">
        <Input
          className="flex-1"
          label="Deliver to PIN code"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          error={pinError}
        />
        <Button type="submit" variant="outline" className="mt-7">
          Check
        </Button>
      </form>
      <p aria-live="polite" className="-mt-3 flex min-h-6 items-center gap-2 font-medium text-fit">
        {delivery && (
          <>
            <Truck aria-hidden className="size-5" /> {delivery}
          </>
        )}
      </p>

      <div className="hidden md:block">
        <Button size="lg" fullWidth onClick={add} leadingIcon={<ShoppingCart className="size-5" />}>
          Add to cart
        </Button>
      </div>

      {/* Phones: sticky bar keeps price + Add to cart in reach. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-sand bg-white px-4 py-3 shadow-sheet md:hidden">
        <PriceBlock price={product.price} />
        <Button className="flex-1" onClick={add} leadingIcon={<ShoppingCart className="size-5" />}>
          Add to cart
        </Button>
      </div>
    </div>
  )
}
