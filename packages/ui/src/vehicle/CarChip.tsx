import { CarFront } from "lucide-react"
import { cn } from "../lib/cn"

export interface CarChipProps {
  /** Full label, e.g. "Hyundai Creta 2021 SX Diesel". Omit when no car is chosen. */
  label?: string
  onChange: () => void
  className?: string
}

/** "Shopping for Hyundai Creta 2021 · Change" strip, or a prompt to pick a car. */
export function CarChip({ label, onChange, className }: CarChipProps) {
  return (
    <div className={cn("flex min-h-tap items-center gap-2 text-sm", className)}>
      <CarFront aria-hidden className="size-5 shrink-0 text-ink" />
      {label ? (
        <p className="min-w-0 flex-1 truncate">
          Shopping for <strong className="font-semibold text-ink">{label}</strong>
        </p>
      ) : (
        <p className="flex-1 text-graphite">No car selected: showing all items</p>
      )}
      <button
        type="button"
        onClick={onChange}
        className="inline-flex min-h-tap shrink-0 items-center px-2 font-semibold text-teal-600 underline underline-offset-4"
      >
        {label ? (
          <>
            Change<span className="sr-only"> car</span>
          </>
        ) : (
          "Select car"
        )}
      </button>
    </div>
  )
}
