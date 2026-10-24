"use client"

import { PlusIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * Type a tag and press Enter (or a comma) to add it; existing tags are offered
 * underneath as one-click suggestions. Tags are stored lower-case unless
 * `lowercase` is off (option values such as "XL" or "Moss" keep their case).
 */
export function TagInput({
  id,
  value,
  onChange,
  suggestions = [],
  placeholder = "Add a tag",
  lowercase = true,
  invalid,
  "aria-label": ariaLabel,
}: {
  id?: string
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  lowercase?: boolean
  invalid?: boolean
  "aria-label"?: string
}) {
  const [text, setText] = useState("")
  const [touched, setTouched] = useState(false)
  const add = (raw: string) => {
    const cleaned = raw.trim().replace(/,$/, "").trim()
    const tag = lowercase ? cleaned.toLowerCase() : cleaned
    if (tag && !has(tag)) {
      onChange([...value, tag])
    }
    setText("")
  }
  const typed = text.trim().toLowerCase()
  const has = (tag: string) => value.some((entry) => entry.toLowerCase() === tag.toLowerCase())
  // Suggestions appear once the field is used, so a tag list at rest stays quiet. They
  // stay after focus leaves: hiding them on blur moved the buttons below mid-click.
  const offered = !touched ? [] : suggestions.filter((tag) => !has(tag) && (!typed || tag.toLowerCase().includes(typed))).slice(0, 8)

  return (
    <div
      className="flex flex-col gap-2"
      onFocus={() => setTouched(true)}
    >
      <Input
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        value={text}
        placeholder={placeholder}
        onChange={(event) => {
          if (event.target.value.endsWith(",")) {
            add(event.target.value)
          } else {
            setText(event.target.value)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            add(text)
          } else if (event.key === "Backspace" && !text && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Tags">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="pe-0.5">
              {tag}
              <Button
                variant="ghost"
                size="icon-xs"
                className="size-4 rounded-full"
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(value.filter((entry) => entry !== tag))}
              >
                <XIcon />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      {offered.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Used before:</span>
          {offered.map((tag) => (
            <Button key={tag} variant="outline" size="xs" className="rounded-full" onClick={() => add(tag)}>
              <PlusIcon data-icon="inline-start" />
              {tag}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
