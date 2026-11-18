"use client"

import { SearchBox, type SearchSuggestion } from "@autoparts/ui"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import type { Suggestion } from "@/lib/search"

const DEBOUNCE_MS = 200

/** Header search: fetches suggestions as the shopper types (debounced, latest wins). */
export function SiteSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const latest = useRef<AbortController | null>(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      latest.current?.abort()
      return
    }
    const timer = setTimeout(async () => {
      latest.current?.abort()
      const controller = new AbortController()
      latest.current = controller
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        const data = (await res.json()) as { suggestions: Suggestion[] }
        setSuggestions(
          data.suggestions.map((s) => ({ id: s.id, label: s.title, href: `/p/${s.handle}` }))
        )
      } catch {
        // Aborted by a newer keystroke, or offline: keep the box usable without suggestions.
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  // Short queries show no suggestions (derived here rather than cleared in the effect).
  const visible = query.trim().length >= 2 ? suggestions : []

  return (
    <SearchBox
      suggestions={visible}
      onQueryChange={setQuery}
      onNavigate={(href) => router.push(href)}
    />
  )
}
