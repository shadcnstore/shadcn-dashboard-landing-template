"use client"

import { BookmarkPlusIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useSavedViews } from "../data/saved-views"
import { sameSnapshot, type ListSnapshot } from "../data/url-state"

export interface BuiltInView {
  value: string
  label: string
}

/**
 * The tabs above a table: fixed views ("Unfulfilled") and the user's own saved
 * views. A saved view restores search, filters and sort in one click.
 */
export function ViewTabs({
  list,
  views,
  current,
  onViewChange,
  snapshot,
  onApply,
  canSave,
}: {
  /** Key the saved views are stored under, e.g. "orders". */
  list: string
  views: BuiltInView[]
  /** The built-in view the address is on. */
  current: string
  onViewChange: (value: string) => void
  snapshot: ListSnapshot
  onApply: (snapshot: ListSnapshot) => void
  /** Offer "Save view" only when the list differs from a plain built-in view. */
  canSave: boolean
}) {
  const saved = useSavedViews(list)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const matching = saved.views.find((view) => sameSnapshot(view.snapshot, snapshot))
  const value = matching ? matching.id : current

  const save = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      return
    }
    saved.add(name.trim(), snapshot)
    setName("")
    setOpen(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tabs
        value={value}
        onValueChange={(next) => {
          const view = saved.views.find((entry) => entry.id === next)
          if (view) {
            onApply(view.snapshot)
          } else {
            onViewChange(String(next))
          }
        }}
      >
        <TabsList className="max-w-full flex-wrap group-data-horizontal/tabs:h-auto">
          {views.map((view) => (
            <TabsTrigger key={view.value} value={view.value}>
              {view.label}
            </TabsTrigger>
          ))}
          {saved.views.map((view) => (
            <TabsTrigger key={view.id} value={view.id}>
              {view.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {matching && (
        <Button variant="ghost" size="sm" onClick={() => saved.remove(matching.id)}>
          <XIcon data-icon="inline-start" />
          Delete view
        </Button>
      )}
      {canSave && !matching && (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <BookmarkPlusIcon data-icon="inline-start" />
          Save view
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={save} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Save this view</DialogTitle>
              <DialogDescription>Keeps the current search, filters and sort as a tab. Saved in this browser.</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="view-name">Name</FieldLabel>
                <Input id="view-name" autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Wholesale to ship" />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button" />}>Cancel</DialogClose>
              <Button type="submit" disabled={!name.trim()}>
                Save view
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
