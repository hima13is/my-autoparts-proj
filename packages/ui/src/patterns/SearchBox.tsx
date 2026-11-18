"use client"

import { Search } from "lucide-react"
import { useId, useRef, useState, type KeyboardEvent } from "react"
import { cn } from "../lib/cn"

export interface SearchSuggestion {
  id: string
  label: string
  href: string
  /** Small text on the right, e.g. "Fits your Creta". */
  hint?: string
}

export interface SearchBoxProps {
  /** Where the form submits (GET ?q=). */
  action?: string
  /** Suggestions for the current text (the caller fetches them). */
  suggestions: SearchSuggestion[]
  /** Called on every change of the text; debounce in the caller. */
  onQueryChange?: (query: string) => void
  /** Go to a suggestion. Defaults to a full page load. */
  onNavigate?: (href: string) => void
  /** Show the list on first render (stories and screenshots). */
  defaultOpen?: boolean
  defaultValue?: string
  placeholder?: string
  className?: string
}

/**
 * Header search with suggestions, following the WAI-ARIA combobox pattern (list popup):
 * ↓/↑ move through suggestions, Enter opens one (or searches), Esc closes the list
 * (or clears the box). Without JavaScript it is still a plain GET form.
 */
export function SearchBox({
  action = "/search",
  suggestions,
  onQueryChange,
  onNavigate = (href) => window.location.assign(href),
  defaultOpen = false,
  defaultValue = "",
  placeholder = "Search seat covers, dashcams…",
  className,
}: SearchBoxProps) {
  const id = useId()
  const listId = `${id}-list`
  const [query, setQuery] = useState(defaultValue)
  const [open, setOpen] = useState(defaultOpen)
  const [active, setActive] = useState(-1)
  const input = useRef<HTMLInputElement>(null)

  const q = query.trim()
  const options: SearchSuggestion[] = q
    ? [
        ...suggestions,
        {
          id: "all",
          label: `See all results for “${q}”`,
          href: `${action}?q=${encodeURIComponent(q)}`,
        },
      ]
    : []
  const expanded = open && options.length > 0
  const optionId = (i: number) => `${id}-opt-${i}`

  const go = (href: string) => {
    setOpen(false)
    setActive(-1)
    onNavigate(href)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!options.length) return
      e.preventDefault()
      setOpen(true)
      const step = e.key === "ArrowDown" ? 1 : -1
      // -1 is "the text box itself": moving past either end returns to it.
      setActive((i) => {
        const next = i + step
        if (next >= options.length) return -1
        if (next < -1) return options.length - 1
        return next
      })
      return
    }
    if (e.key === "Enter" && expanded && active >= 0 && options[active]) {
      e.preventDefault()
      go(options[active].href)
      return
    }
    if (e.key === "Escape") {
      if (expanded) {
        e.preventDefault()
        setOpen(false)
        setActive(-1)
      } else if (query) {
        e.currentTarget.value = ""
        setQuery("")
        onQueryChange?.("")
      }
    }
  }

  return (
    <form
      role="search"
      action={action}
      method="get"
      className={cn(
        "relative order-last w-full basis-full md:order-none md:basis-auto md:flex-1",
        className
      )}
    >
      <label htmlFor={`${id}-input`} className="sr-only">
        Search accessories
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-graphite"
      />
      <input
        ref={input}
        id={`${id}-input`}
        name="q"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        placeholder={placeholder}
        // Uncontrolled on purpose: text typed before the page hydrates must survive it
        // (a controlled value would reset it to the initial state).
        defaultValue={defaultValue}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(-1)
          setOpen(true)
          onQueryChange?.(e.target.value)
        }}
        onFocus={(e) => {
          // Pick up anything typed before hydration.
          if (e.currentTarget.value !== query) setQuery(e.currentTarget.value)
          setOpen(true)
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="min-h-tap w-full rounded-xl border-2 border-transparent bg-white pl-11 pr-4 text-charcoal placeholder:text-graphite"
      />
      <ul
        id={listId}
        role="listbox"
        aria-label="Search suggestions"
        hidden={!expanded}
        className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-sand bg-white py-1 shadow-sheet"
      >
        {options.map((o, i) => (
          <li
            key={o.id}
            id={optionId(i)}
            role="option"
            aria-selected={i === active}
            // mousedown, not click: it runs before the input's blur closes the list.
            onMouseDown={(e) => {
              e.preventDefault()
              go(o.href)
            }}
            onMouseEnter={() => setActive(i)}
            className={cn(
              "flex min-h-tap cursor-pointer items-center gap-3 px-4 py-2 text-charcoal",
              i === active && "bg-cream",
              o.id === "all" && "border-t border-sand font-semibold text-teal-600"
            )}
          >
            <span className="min-w-0 flex-1 truncate">{o.label}</span>
            {o.hint && <span className="shrink-0 text-sm text-graphite">{o.hint}</span>}
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite">
        {expanded && suggestions.length
          ? `${suggestions.length} ${suggestions.length === 1 ? "suggestion" : "suggestions"}`
          : ""}
      </p>
    </form>
  )
}
