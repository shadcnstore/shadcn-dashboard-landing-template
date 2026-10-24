"use client"

import { AlertCircleIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/kit/auth/auth-client"

import { AuthHeader } from "./auth-shell"
import { PasswordInput } from "./password-input"
import { SocialButtons } from "./social-buttons"
import { emailError, messageOf } from "./validate"

type Errors = { email?: string; password?: string }

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found: Errors = { email: emailError(email), password: password ? undefined : "Enter your password." }
    setErrors(found)
    setFormError(undefined)
    if (found.email || found.password) {
      event.currentTarget.querySelector<HTMLElement>(`#${found.email ? "sign-in-email" : "sign-in-password"}`)?.focus()
      return
    }
    setPending(true)
    try {
      // The demo client asks for a second step; Chronicle's free edition has no code screen, so it goes straight in.
      await authClient.signIn(email.trim(), password)
      router.push("/")
    } catch (error) {
      setFormError(messageOf(error))
      setPending(false)
    }
  }

  return (
    <>
      <AuthHeader
        title="Sign in to Chronicle"
        description={
          <>
            New here?{" "}
            <Link href="/sign-up" className="font-medium text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </>
        }
      />
      <SocialButtons disabled={pending} onError={setFormError} />
      <form noValidate onSubmit={onSubmit}>
        <FieldGroup className="gap-5">
          {formError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
            <Input
              id="sign-in-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              className="h-9"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setErrors((current) => ({ ...current, email: undefined }))
              }}
              aria-invalid={!!errors.email || undefined}
              aria-describedby={errors.email ? "sign-in-email-error" : undefined}
            />
            <FieldError id="sign-in-email-error">{errors.email}</FieldError>
          </Field>
          <Field data-invalid={!!errors.password || undefined}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
              <Link href="/forgot-password" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="sign-in-password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setErrors((current) => ({ ...current, password: undefined }))
              }}
              aria-invalid={!!errors.password || undefined}
              aria-describedby={errors.password ? "sign-in-password-error" : undefined}
            />
            <FieldError id="sign-in-password-error">{errors.password}</FieldError>
          </Field>
          <Button type="submit" size="lg" className="h-9 w-full" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? "Signing in" : "Sign in"}
          </Button>
        </FieldGroup>
      </form>
    </>
  )
}
