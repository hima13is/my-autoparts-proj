"use client"

import type { SelectedVehicle } from "@autoparts/ui"
import { useSyncExternalStore } from "react"

/**
 * Prototype-only state (Build Phase 1): the shopper's car and a mock cart,
 * kept in localStorage. Phase 2/3 replace this with Medusa carts and accounts.
 */
export interface CartLine {
  slug: string
  qty: number
  colour?: string
}

export interface PrototypeState {
  car?: SelectedVehicle
  cart: CartLine[]
}

const KEY = "fitgaadi:prototype:v1"
const EMPTY: PrototypeState = { cart: [] }

let state: PrototypeState = EMPTY
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) }
  } catch {
    // Private mode or blocked storage: start empty.
  }
}

function set(next: PrototypeState) {
  state = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Ignore: the prototype still works for this page view.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  load()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  load()
  return state
}

const getServerSnapshot = () => EMPTY

export function usePrototypeState(): PrototypeState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export const prototypeActions = {
  setCar(car: SelectedVehicle | undefined) {
    set({ ...state, car })
  },
  addToCart(slug: string, colour?: string) {
    const existing = state.cart.find((l) => l.slug === slug && l.colour === colour)
    const cart = existing
      ? state.cart.map((l) => (l === existing ? { ...l, qty: Math.min(l.qty + 1, 10) } : l))
      : [...state.cart, { slug, qty: 1, colour }]
    set({ ...state, cart })
  },
  setQty(slug: string, colour: string | undefined, qty: number) {
    set({
      ...state,
      cart: state.cart.map((l) => (l.slug === slug && l.colour === colour ? { ...l, qty } : l)),
    })
  },
  remove(slug: string, colour: string | undefined) {
    set({ ...state, cart: state.cart.filter((l) => !(l.slug === slug && l.colour === colour)) })
  },
}

export function cartCount(s: PrototypeState): number {
  return s.cart.reduce((n, l) => n + l.qty, 0)
}
