"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { ListSnapshot } from "./url-state"

/**
 * Views a user saves on a list ("Wholesale to ship", "High value this week").
 * They are a personal preference, so they live in this browser. To share them
 * across a team, store them through your backend instead.
 */

export interface SavedView {
  id: string
  name: string
  snapshot: ListSnapshot
}

interface SavedViewsState {
  views: Record<string, SavedView[]>
  add: (list: string, name: string, snapshot: ListSnapshot) => SavedView
  remove: (list: string, id: string) => void
}

const useSavedViewsStore = create<SavedViewsState>()(
  persist(
    (set) => ({
      views: {},
      add: (list, name, snapshot) => {
        const view = { id: `view_${Date.now().toString(36)}`, name, snapshot }
        set((state) => ({ views: { ...state.views, [list]: [...(state.views[list] ?? []), view] } }))
        return view
      },
      remove: (list, id) => set((state) => ({ views: { ...state.views, [list]: (state.views[list] ?? []).filter((view) => view.id !== id) } })),
    }),
    {
      name: "kit-saved-views",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ views: state.views }),
      // Read after mount, so the server HTML and the first client render match.
      skipHydration: true,
    }
  )
)

const EMPTY: SavedView[] = []

export function useSavedViews(list: string) {
  useEffect(() => {
    void useSavedViewsStore.persist.rehydrate()
  }, [])
  const views = useSavedViewsStore((state) => state.views[list] ?? EMPTY)
  const add = useSavedViewsStore((state) => state.add)
  const remove = useSavedViewsStore((state) => state.remove)
  return {
    views,
    add: (name: string, snapshot: ListSnapshot) => add(list, name, snapshot),
    remove: (id: string) => remove(list, id),
  }
}
