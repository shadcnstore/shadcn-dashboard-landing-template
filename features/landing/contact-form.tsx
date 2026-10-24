"use client"

import { CheckCircle2Icon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

type Values = { name: string; email: string; company: string; message: string }
type Errors = Partial<Record<keyof Values, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: Values): Errors {
  const errors: Errors = {}
  if (values.name.trim().length < 2) {
    errors.name = "Enter your name."
  }
  if (!EMAIL.test(values.email.trim())) {
    errors.email = "Enter an email address like you@company.com."
  }
  if (values.message.trim().length < 10) {
    errors.message = "Tell us a little more, at least 10 characters."
  }
  return errors
}

/**
 * Plain controlled form with no form library, so the landing page ships less
 * JavaScript. Replace the timeout in `onSubmit` with your own endpoint.
 */
export function ContactForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", company: "", message: "" })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")

  function update(field: keyof Values) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }))
      if (errors[field]) {
        setErrors((current) => ({ ...current, [field]: undefined }))
      }
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0]
      event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setStatus("sending")
    await new Promise((resolve) => setTimeout(resolve, 700))
    setStatus("sent")
  }

  if (status === "sent") {
    return (
      <div role="status" className="flex min-h-80 flex-col items-center justify-center gap-3 text-center">
        <CheckCircle2Icon className="size-8 text-success" aria-hidden />
        <h3 className="text-lg font-semibold">Thanks, {values.name.trim().split(" ")[0]}.</h3>
        <p className="max-w-sm text-sm text-muted-foreground">We will reply to {values.email.trim()} within one business day.</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => {
            setValues({ name: "", email: "", company: "", message: "" })
            setStatus("idle")
          }}
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={onSubmit}>
      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!errors.name || undefined}>
            <FieldLabel htmlFor="contact-name">Name</FieldLabel>
            <Input id="contact-name" name="name" autoComplete="name" value={values.name} onChange={update("name")} aria-invalid={!!errors.name || undefined} aria-describedby={errors.name ? "contact-name-error" : undefined} />
            <FieldError id="contact-name-error">{errors.name}</FieldError>
          </Field>
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor="contact-email">Work email</FieldLabel>
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={update("email")}
              aria-invalid={!!errors.email || undefined}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
            />
            <FieldError id="contact-email-error">{errors.email}</FieldError>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="contact-company">
            Company <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Input id="contact-company" name="company" autoComplete="organization" value={values.company} onChange={update("company")} />
        </Field>
        <Field data-invalid={!!errors.message || undefined}>
          <FieldLabel htmlFor="contact-message">How can we help?</FieldLabel>
          <Textarea
            id="contact-message"
            name="message"
            rows={5}
            value={values.message}
            onChange={update("message")}
            aria-invalid={!!errors.message || undefined}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
          />
          <FieldError id="contact-message-error">{errors.message}</FieldError>
        </Field>
        <Button type="submit" size="lg" className="h-10 sm:self-start" disabled={status === "sending"}>
          {status === "sending" && <Spinner data-icon="inline-start" />}
          {status === "sending" ? "Sending" : "Send message"}
        </Button>
      </FieldGroup>
    </form>
  )
}
