"use client"

import { useSyncExternalStore } from "react"
import { EMPTY_GARAGE, parseGarage, type GarageState } from "./garage"

const KEY = "fitgaadi:garage:v1"

let state: GarageState = EMPTY_GARAGE
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    state = parseGarage(window.localStorage.getItem(KEY))
  } catch {
    // Private mode or blocked storage: start empty.
  }
}

function subscribe(listener: () => void) {
  load()
  listeners.add(listener)
  // Keep tabs in sync: choosing a car in one tab updates the others.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return
    state = parseGarage(e.newValue)
    listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

function getSnapshot() {
  load()
  return state
}

const getServerSnapshot = () => EMPTY_GARAGE

export function useGarage(): GarageState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** Apply a pure update from `garage.ts` and save it. */
export function updateGarage(update: (s: GarageState) => GarageState) {
  load()
  const next = update(state)
  if (next === state) return
  state = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked: the choice still works until the page reloads.
  }
  listeners.forEach((l) => l())
}
