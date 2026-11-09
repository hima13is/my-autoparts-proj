import { ChevronDown } from "lucide-react"
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react"
import { cn } from "../lib/cn"

interface FieldChrome {
  /** Visible label (never placeholder-only). */
  label: string
  hint?: string
  /** Error message; marks the control invalid and announces the message. */
  error?: string
  /** Visually hide the label but keep it for screen readers (e.g. a header search box). */
  hideLabel?: boolean
}

function useFieldIds(id?: string) {
  const auto = useId()
  const base = id ?? auto
  return { id: base, hint: `${base}-hint`, error: `${base}-error` }
}

function describedBy(ids: { hint: string; error: string }, hint?: string, error?: string) {
  return [hint && ids.hint, error && ids.error].filter(Boolean).join(" ") || undefined
}

const controlBase =
  "block w-full min-h-tap rounded-xl border-2 bg-white px-4 text-base text-charcoal placeholder:text-graphite " +
  "disabled:cursor-not-allowed disabled:bg-cream disabled:text-graphite"

function Messages({
  ids,
  hint,
  error,
}: {
  ids: { hint: string; error: string }
  hint?: string
  error?: string
}) {
  return (
    <>
      {hint && (
        <p id={ids.hint} className="text-sm text-graphite">
          {hint}
        </p>
      )}
      {error && (
        <p id={ids.error} className="text-sm font-medium text-brick">
          {error}
        </p>
      )}
    </>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldChrome {
  /** Icon or text shown inside the field on the left (e.g. "+91"). */
  leading?: ReactNode
}

export function Input({
  label,
  hint,
  error,
  hideLabel,
  leading,
  id,
  className,
  ...rest
}: InputProps) {
  const ids = useFieldIds(id)
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={ids.id}
        className={cn("text-sm font-semibold text-ink", hideLabel && "sr-only")}
      >
        {label}
      </label>
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-graphite">
            {leading}
          </span>
        )}
        <input
          id={ids.id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, hint, error)}
          className={cn(
            controlBase,
            error ? "border-brick" : "border-stone",
            leading ? "pl-12" : undefined
          )}
          {...rest}
        />
      </div>
      <Messages ids={ids} hint={hint} error={error} />
    </div>
  )
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldChrome {
  options: ReadonlyArray<{ value: string; label: string; disabled?: boolean }>
  /** First, empty option, e.g. "Select make". */
  placeholder?: string
}

/** Native <select>: best keyboard, screen-reader and mobile picker support. */
export function Select({
  label,
  hint,
  error,
  hideLabel,
  options,
  placeholder,
  id,
  className,
  ...rest
}: SelectProps) {
  const ids = useFieldIds(id)
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={ids.id}
        className={cn("text-sm font-semibold text-ink", hideLabel && "sr-only")}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={ids.id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, hint, error)}
          className={cn(
            controlBase,
            "appearance-none pr-11",
            error ? "border-brick" : "border-stone"
          )}
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-ink"
        />
      </div>
      <Messages ids={ids} hint={hint} error={error} />
    </div>
  )
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode
  hint?: string
}

/** Native checkbox in a 44px-tall row; the whole row is clickable. */
export function Checkbox({ label, hint, id, className, ...rest }: CheckboxProps) {
  const ids = useFieldIds(id)
  return (
    <div className={cn("flex flex-col", className)}>
      <label
        htmlFor={ids.id}
        className="flex min-h-tap cursor-pointer items-center gap-3 text-base"
      >
        <input
          id={ids.id}
          type="checkbox"
          aria-describedby={hint ? ids.hint : undefined}
          className="size-5 shrink-0 cursor-pointer accent-ink"
          {...rest}
        />
        <span>{label}</span>
      </label>
      {hint && (
        <p id={ids.hint} className="-mt-2 pl-8 text-sm text-graphite">
          {hint}
        </p>
      )}
    </div>
  )
}

export interface RadioGroupProps {
  legend: string
  name: string
  options: ReadonlyArray<{ value: string; label: ReactNode; hint?: string; disabled?: boolean }>
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  error?: string
  className?: string
}

/** Radio buttons in a <fieldset> with a visible legend. Arrow keys move between options natively. */
export function RadioGroup({
  legend,
  name,
  options,
  value,
  defaultValue,
  onChange,
  error,
  className,
}: RadioGroupProps) {
  const ids = useFieldIds()
  return (
    <fieldset
      className={cn("flex flex-col", className)}
      aria-describedby={error ? ids.error : undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="mb-1 text-sm font-semibold text-ink">{legend}</legend>
      {options.map((o, i) => {
        const optionId = `${ids.id}-${i}`
        return (
          <label
            key={o.value}
            htmlFor={optionId}
            className="flex min-h-tap cursor-pointer items-center gap-3"
          >
            <input
              id={optionId}
              type="radio"
              name={name}
              value={o.value}
              disabled={o.disabled}
              checked={value === undefined ? undefined : value === o.value}
              defaultChecked={defaultValue === undefined ? undefined : defaultValue === o.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="size-5 shrink-0 cursor-pointer accent-ink"
            />
            <span className="flex flex-col">
              <span>{o.label}</span>
              {o.hint && <span className="text-sm text-graphite">{o.hint}</span>}
            </span>
          </label>
        )
      })}
      {error && (
        <p id={ids.error} className="text-sm font-medium text-brick">
          {error}
        </p>
      )}
    </fieldset>
  )
}
