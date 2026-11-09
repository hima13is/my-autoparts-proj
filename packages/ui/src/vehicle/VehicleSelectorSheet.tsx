"use client"

import { ArrowLeft, ChevronRight, Search } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "../components/Button"
import { Sheet } from "../components/Sheet"
import { cn } from "../lib/cn"
import { findVehicle, type SelectedVehicle, type VehicleCatalog } from "./catalog"

type Step = "make" | "model" | "year" | "variant"
const STEPS: Step[] = ["make", "model", "year", "variant"]
const TITLES: Record<Step, string> = {
  make: "Select your car's make",
  model: "Select model",
  year: "Select year",
  variant: "Select variant",
}

export interface VehicleSelectorSheetProps {
  catalog: VehicleCatalog
  open: boolean
  onClose: () => void
  onSelect: (vehicle: SelectedVehicle) => void
  /** "Skip": browse items that fit every car. */
  onSkip?: () => void
}

/**
 * Four big-tap-target steps, one per screen (bottom sheet on phones, modal on
 * desktop). The make list has a search box. Variant can be skipped.
 */
export function VehicleSelectorSheet({
  catalog,
  open,
  onClose,
  onSelect,
  onSkip,
}: VehicleSelectorSheetProps) {
  const [sel, setSel] = useState<Partial<SelectedVehicle>>({})
  const [query, setQuery] = useState("")
  const listRef = useRef<HTMLUListElement>(null)
  const { make, model, year } = findVehicle(catalog, sel)

  const step: Step = !sel.makeId ? "make" : !sel.modelId ? "model" : !sel.year ? "year" : "variant"
  const stepNumber = STEPS.indexOf(step) + 1

  // Start fresh next time it opens.
  const reset = () => {
    setSel({})
    setQuery("")
  }
  const close = () => {
    reset()
    onClose()
  }
  const select = (vehicle: SelectedVehicle) => {
    reset()
    onSelect(vehicle)
  }

  const options = useMemo(() => {
    switch (step) {
      case "make": {
        const q = query.trim().toLowerCase()
        return catalog.makes
          .filter((m) => m.name.toLowerCase().includes(q))
          .map((m) => ({ key: m.id, label: m.name, pick: () => setSel({ makeId: m.id }) }))
      }
      case "model":
        return (make?.models ?? []).map((m) => ({
          key: m.id,
          label: m.name,
          pick: () => setSel({ makeId: sel.makeId, modelId: m.id }),
        }))
      case "year":
        return (model?.years ?? []).map((y) => ({
          key: String(y.year),
          label: String(y.year),
          pick: () => setSel({ makeId: sel.makeId, modelId: sel.modelId, year: y.year }),
        }))
      case "variant":
        return (year?.variants ?? []).map((v) => ({
          key: v.id,
          label: v.name,
          pick: () => select({ ...(sel as SelectedVehicle), variantId: v.id }),
        }))
    }
  }, [step, query, catalog, make, model, year, sel]) // eslint-disable-line react-hooks/exhaustive-deps

  // Move focus to the first option on each new step (keyboard + screen readers follow along).
  useEffect(() => {
    if (open && step !== "make") listRef.current?.querySelector("button")?.focus()
  }, [step, open])

  const back = () => {
    if (step === "variant") setSel({ makeId: sel.makeId, modelId: sel.modelId })
    else if (step === "year") setSel({ makeId: sel.makeId })
    else if (step === "model") setSel({})
  }

  const crumbs = [make?.name, model?.name, sel.year].filter(Boolean).join(" · ")

  return (
    <Sheet
      open={open}
      onClose={close}
      title={TITLES[step]}
      description={`Step ${stepNumber} of 4${crumbs ? ` · ${crumbs}` : ""}`}
      footer={
        step === "variant" ? (
          <Button fullWidth variant="outline" onClick={() => select(sel as SelectedVehicle)}>
            I&apos;m not sure, show all {model?.name} {sel.year} items
          </Button>
        ) : onSkip && step === "make" ? (
          <Button
            fullWidth
            variant="ghost"
            onClick={() => {
              reset()
              onSkip()
            }}
          >
            Skip, show items that fit every car
          </Button>
        ) : undefined
      }
    >
      {step !== "make" && (
        <button
          type="button"
          onClick={back}
          className="mb-2 inline-flex min-h-tap items-center gap-1 font-semibold text-teal-600"
        >
          <ArrowLeft aria-hidden className="size-5" /> Back
        </button>
      )}
      {step === "make" && (
        <div className="relative mb-3">
          <label htmlFor="vehicle-make-search" className="sr-only">
            Search makes
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-graphite"
          />
          <input
            id="vehicle-make-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search makes, e.g. Hyundai"
            className="min-h-tap w-full rounded-xl border-2 border-stone bg-white pl-12 pr-4"
          />
        </div>
      )}
      <ul
        ref={listRef}
        className={cn("grid gap-2", step === "year" ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}
      >
        {options.map((o) => (
          <li key={o.key}>
            <button
              type="button"
              onClick={o.pick}
              className="flex min-h-14 w-full items-center justify-between gap-2 rounded-xl border-2 border-sand bg-white px-4 text-left font-semibold text-charcoal hover:border-ink"
            >
              {o.label}
              {step !== "year" && <ChevronRight aria-hidden className="size-5 text-graphite" />}
            </button>
          </li>
        ))}
      </ul>
      {options.length === 0 && (
        <p className="py-6 text-center text-graphite">No makes match &ldquo;{query}&rdquo;.</p>
      )}
    </Sheet>
  )
}
