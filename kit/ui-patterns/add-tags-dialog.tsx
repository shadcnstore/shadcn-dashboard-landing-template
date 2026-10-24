"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { TagInput } from "./tag-input"

/** Bulk action: add the same tags to every selected record. */
export function AddTagsDialog({
  open,
  onOpenChange,
  count,
  suggestions,
  onSubmit,
  noun = "item",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
  suggestions: string[]
  onSubmit: (tags: string[]) => void
  /** What is being tagged, singular: "deal", "customer". */
  noun?: string
}) {
  const [tags, setTags] = useState<string[]>([])
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          setTags([])
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add tags</DialogTitle>
          <DialogDescription>
            Added to {count} {count === 1 ? noun : `${noun}s`}. Existing tags stay.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="bulk-tags">Tags</FieldLabel>
            <TagInput id="bulk-tags" value={tags} onChange={setTags} suggestions={suggestions} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button disabled={tags.length === 0} onClick={() => onSubmit(tags)}>
            Add tags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
