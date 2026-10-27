"use client"

import { AlertCircleIcon, ArrowLeftIcon, MailCheckIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/kit/auth/auth-client"
import { cn } from "@/lib/utils"

import { AuthHeader } from "./auth-shell"
import { useAuthHref } from "./auth-variant"
import { emailError, messageOf } from "./validate"

function BackToSignIn() {
  const authHref = useAuthHref()
  return (
    <Link href={authHref("sign-in")} className={cn(buttonVariants({ variant: "ghost" }), "mt-6 w-full text-muted-foreground")}>
      <ArrowLeftIcon data-icon="inline-start" />
      Back to sign in
    </Link>
  )
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string>()
  const [formError, setFormError] = useState<string>()
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState<string>()

  async function send(address: string) {
    setPending(true)
    setFormError(undefined)
    try {
      await authClient.requestPasswordReset(address)
      setSentTo(address)
    } catch (caught) {
      setFormError(messageOf(caught))
    } finally {
      setPending(false)
    }
  }

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col">
        <span className="mb-6 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MailCheckIcon className="size-5" aria-hidden />
        </span>
        <AuthHeader
          title="Check your inbox"
          description={
            <>
              If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, a reset link is on its way. It expires in 30 minutes.
            </>
          }
        />
        <Button variant="outline" size="lg" className="h-9 w-full" disabled={pending} onClick={() => send(sentTo)}>
          {pending && <Spinner data-icon="inline-start" />}
          {pending ? "Sending" : "Send it again"}
        </Button>
        <button type="button" className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" onClick={() => setSentTo(undefined)}>
          Use a different email
        </button>
        <BackToSignIn />
      </div>
    )
  }

  return (
    <>
      <AuthHeader title="Reset your password" description="Enter the email you sign in with and we will send you a link to choose a new password." />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const found = emailError(email)
          setError(found)
          if (found) {
            event.currentTarget.querySelector<HTMLElement>("#forgot-email")?.focus()
            return
          }
          void send(email.trim())
        }}
      >
        <FieldGroup className="gap-5">
          {formError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={!!error || undefined}>
            <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
            <Input
              id="forgot-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              className="h-9"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError(undefined)
              }}
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "forgot-email-error" : undefined}
            />
            <FieldError id="forgot-email-error">{error}</FieldError>
          </Field>
          <Button type="submit" size="lg" className="h-9 w-full" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? "Sending link" : "Send reset link"}
          </Button>
        </FieldGroup>
      </form>
      <BackToSignIn />
    </>
  )
}
