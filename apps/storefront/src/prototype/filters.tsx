"use client"

import { Button, Checkbox, RadioGroup, Select, Sheet } from "@autoparts/ui"
import { SlidersHorizontal } from "lucide-react"
import { useState } from "react"

/** Filter + sort bar for the category page (mock: choices don't change the list yet). */
export function FilterBar({ resultCount }: { resultCount: number }) {
  const [open, setOpen] = useState(false)
  const [fitsOnly, setFitsOnly] = useState(true)
  const active = (fitsOnly ? 1 : 0) + 1

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        leadingIcon={<SlidersHorizontal className="size-5" />}
      >
        Filters ({active})
      </Button>
      <Select
        className="w-48"
        label="Sort by"
        hideLabel
        defaultValue="popular"
        options={[
          { value: "popular", label: "Sort: Popular" },
          { value: "price-asc", label: "Price: low to high" },
          { value: "price-desc", label: "Price: high to low" },
          { value: "rating", label: "Customer rating" },
        ]}
      />
      <p className="ml-auto text-sm text-graphite">{resultCount} results</p>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        description="Demo only: filters don't change results yet"
        footer={
          <Button fullWidth onClick={() => setOpen(false)}>
            Show {resultCount} results
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          <Checkbox
            label="Fits my car only"
            checked={fitsOnly}
            onChange={(e) => setFitsOnly(e.target.checked)}
          />
          <Checkbox label="Cash on delivery available" />
          <RadioGroup
            legend="Price"
            name="price"
            defaultValue="any"
            options={[
              { value: "any", label: "Any price" },
              { value: "u1000", label: "Under ₹1,000" },
              { value: "1-3", label: "₹1,000 – ₹3,000" },
              { value: "o3000", label: "Over ₹3,000" },
            ]}
          />
        </div>
      </Sheet>
    </div>
  )
}
