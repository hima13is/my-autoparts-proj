"use client"

import { Button, Card, FitBadge, Input, PriceBlock, RadioGroup } from "@autoparts/ui"
import { MapPin, ShoppingCart, Truck } from "lucide-react"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { useCar } from "@/components/site-shell"
import {
  describeEstimate,
  normalisePincode,
  PIN_STORAGE_KEY,
  type DeliveryEstimate,
} from "@/lib/delivery"
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

type DeliveryState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; estimate: DeliveryEstimate }

const readSavedPin = () => {
  try {
    return normalisePincode(localStorage.getItem(PIN_STORAGE_KEY))
  } catch {
    return null
  }
}

const savePin = (pin: string) => {
  try {
    localStorage.setItem(PIN_STORAGE_KEY, pin)
  } catch {
    // Private mode or blocked storage: the check still works, it just isn't remembered.
  }
}

const pinField = (form: HTMLFormElement | null) =>
  form?.elements.namedItem("pincode") as HTMLInputElement | null

const UNAVAILABLE = "We couldn't check delivery right now. Please try again."

async function fetchEstimate(pin: string): Promise<DeliveryState> {
  try {
    const res = await fetch(`/api/delivery?pincode=${pin}`)
    const body = (await res.json()) as { estimate?: DeliveryEstimate; error?: string }
    if (!res.ok || !body.estimate) return { kind: "error", message: body.error ?? UNAVAILABLE }
    savePin(pin)
    return { kind: "done", estimate: body.estimate }
  } catch {
    return { kind: "error", message: UNAVAILABLE }
  }
}

/**
 * "Deliver to" check. The input is uncontrolled so digits typed before hydration survive.
 * The last PIN is remembered on this device and re-checked on the next product page.
 */
export function DeliveryPanel() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<DeliveryState>({ kind: "idle" })
  const [fieldError, setFieldError] = useState<string>()

  // Re-check the PIN remembered from an earlier product page.
  useEffect(() => {
    const saved = readSavedPin()
    const input = pinField(formRef.current)
    if (!saved || !input || input.value) return
    input.value = saved
    void fetchEstimate(saved).then(setState)
  }, [])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const pin = normalisePincode(pinField(formRef.current)?.value)
    if (!pin) {
      setState({ kind: "idle" })
      setFieldError("Enter a 6-digit PIN code.")
      pinField(formRef.current)?.focus()
      return
    }
    setFieldError(undefined)
    setState({ kind: "loading" })
    void fetchEstimate(pin).then(setState)
  }

  const estimate = state.kind === "done" ? state.estimate : null
  return (
    <Card
      as="section"
      aria-labelledby="delivery-title"
      padding="md"
      className="flex flex-col gap-3"
    >
      <h2 id="delivery-title" className="font-heading text-lg font-bold text-ink">
        Delivery
      </h2>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex items-start gap-2">
        <Input
          label="PIN code"
          name="pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={7}
          placeholder="e.g. 110001"
          leading={<MapPin className="size-5" aria-hidden />}
          error={fieldError}
          className="flex-1"
        />
        <Button
          type="submit"
          variant="secondary"
          loading={state.kind === "loading"}
          className="mt-[1.625rem]"
        >
          Check
        </Button>
      </form>
      <div role="status" aria-live="polite" className="flex flex-col gap-1">
        {state.kind === "error" && <p className="text-brick">{state.message}</p>}
        {estimate && (
          <>
            <p className="flex items-start gap-2 font-semibold text-ink">
              <Truck className="mt-0.5 size-5 shrink-0" aria-hidden />
              {describeEstimate(estimate)}
            </p>
            {estimate.serviceable && (
              <p className="text-sm text-graphite">
                {estimate.cod
                  ? "Cash on delivery is available."
                  : "Pay online for this PIN code: cash on delivery isn't available."}
              </p>
            )}
          </>
        )}
      </div>
    </Card>
  )
}
