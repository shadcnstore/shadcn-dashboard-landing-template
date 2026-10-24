"use client"

import { useState } from "react"

/**
 * An editable copy of saved data. `dirty` compares the two; when fresh data
 * arrives (after a save, or once loading finishes) the copy resets to it.
 * Resetting in place, not by remounting, keeps the save's toast alive.
 */
export function useDraft<T>(saved: T | undefined) {
  const [draft, setDraft] = useState<T | undefined>(saved)
  const savedKey = JSON.stringify(saved)
  const [lastKey, setLastKey] = useState(savedKey)
  if (savedKey !== lastKey) {
    setLastKey(savedKey)
    setDraft(saved)
  }
  const dirty = saved !== undefined && JSON.stringify(draft) !== savedKey
  return {
    draft,
    setDraft: (next: T | ((current: T) => T)) => setDraft((current) => (typeof next === "function" ? (next as (current: T) => T)(current as T) : next)),
    dirty,
    reset: () => setDraft(saved),
  }
}
