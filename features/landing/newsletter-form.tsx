"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Signs up for the journal. Swap the confirmation for a call to your mailing list provider. */
export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string>()
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        You are on the list. The next issue goes out on the first Tuesday of the month.
      </p>
    )
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!EMAIL.test(email.trim())) {
          setError("Enter an email address like you@company.com.")
          return
        }
        setDone(true)
      }}
    >
      <Field data-invalid={!!error || undefined}>
        <FieldLabel htmlFor="newsletter-email" className="sr-only">
          Email address
        </FieldLabel>
        <div className="flex gap-2">
          <Input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError(undefined)
            }}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? "newsletter-error" : undefined}
          />
          <Button type="submit" variant="secondary">
            Subscribe
          </Button>
        </div>
        <FieldError id="newsletter-error">{error}</FieldError>
      </Field>
    </form>
  )
}
