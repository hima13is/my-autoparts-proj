"use client"

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { cn } from "../lib/cn"

export interface TabItem {
  id: string
  label: string
  content: ReactNode
}

export interface TabsProps {
  items: ReadonlyArray<TabItem>
  /** Accessible name for the tab list, e.g. "Product information". */
  label: string
  defaultTab?: string
  className?: string
}

/**
 * WAI-ARIA tabs: ←/→ move between tabs (wrapping), Home/End jump, only the
 * active tab is in the Tab order, and the panel is focusable.
 */
export function Tabs({ items, label, defaultTab, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? items[0]?.id)
  const base = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const focusTab = (index: number) => {
    const i = (index + items.length) % items.length
    setActive(items[i].id)
    tabRefs.current[i]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => focusTab(index + 1),
      ArrowLeft: () => focusTab(index - 1),
      Home: () => focusTab(0),
      End: () => focusTab(items.length - 1),
    }
    const action = keys[e.key]
    if (action) {
      e.preventDefault()
      action()
    }
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        className="flex gap-1 overflow-x-auto border-b-2 border-sand"
      >
        {items.map((item, i) => {
          const selected = item.id === active
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "-mb-0.5 min-h-tap shrink-0 whitespace-nowrap border-b-4 px-4 font-semibold transition-colors",
                selected
                  ? "border-marigold text-ink"
                  : "border-transparent text-graphite hover:text-ink"
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-panel-${item.id}`}
          aria-labelledby={`${base}-tab-${item.id}`}
          hidden={item.id !== active}
          tabIndex={0}
          className="py-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
