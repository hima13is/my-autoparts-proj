"use client"

import { ArrowRight } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Button } from "../components/Button"
import { Select } from "../components/Field"
import { cn } from "../lib/cn"
import { findVehicle, type SelectedVehicle, type VehicleCatalog } from "./catalog"

export interface VehicleSelectorFormProps {
  catalog: VehicleCatalog
  onSubmit: (vehicle: SelectedVehicle) => void
  initial?: Partial<SelectedVehicle>
  submitLabel?: string
  className?: string
}

/**
 * Inline make → model → year → variant form (home hero, desktop). Each choice
 * resets the ones after it; the button needs make, model and year.
 */
export function VehicleSelectorForm({
  catalog,
  onSubmit,
  initial = {},
  submitLabel = "Show accessories",
  className,
}: VehicleSelectorFormProps) {
  const [sel, setSel] = useState<Partial<SelectedVehicle>>(initial)
  const { make, model, year } = findVehicle(catalog, sel)
  const complete = Boolean(sel.makeId && sel.modelId && sel.year)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (complete) onSubmit(sel as SelectedVehicle)
  }

  return (
    <form
      onSubmit={submit}
      className={cn("grid grid-cols-2 gap-3", className)}
      aria-label="Select your car"
    >
      <Select
        className="col-span-2"
        label="Make"
        placeholder="Select make"
        value={sel.makeId ?? ""}
        onChange={(e) => setSel({ makeId: e.target.value || undefined })}
        options={catalog.makes.map((m) => ({ value: m.id, label: m.name }))}
      />
      <Select
        className="col-span-2"
        label="Model"
        placeholder={make ? "Select model" : "Select make first"}
        disabled={!make}
        value={sel.modelId ?? ""}
        onChange={(e) => setSel({ makeId: sel.makeId, modelId: e.target.value || undefined })}
        options={(make?.models ?? []).map((m) => ({ value: m.id, label: m.name }))}
      />
      <Select
        label="Year"
        placeholder="Year"
        disabled={!model}
        value={sel.year ? String(sel.year) : ""}
        onChange={(e) =>
          setSel({
            makeId: sel.makeId,
            modelId: sel.modelId,
            year: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        options={(model?.years ?? []).map((y) => ({
          value: String(y.year),
          label: String(y.year),
        }))}
      />
      <Select
        label="Variant"
        placeholder="Any variant"
        disabled={!year}
        value={sel.variantId ?? ""}
        onChange={(e) => setSel({ ...sel, variantId: e.target.value || undefined })}
        options={(year?.variants ?? []).map((v) => ({ value: v.id, label: v.name }))}
      />
      <Button
        type="submit"
        size="lg"
        fullWidth
        className="col-span-2 mt-1"
        disabled={!complete}
        trailingIcon={<ArrowRight className="size-5" />}
      >
        {submitLabel}
      </Button>
    </form>
  )
}
