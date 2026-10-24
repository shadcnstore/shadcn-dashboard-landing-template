"use client"

import { AlertCircleIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/kit/auth/auth-client"
import { StrengthMeter } from "@/kit/auth/password-strength"

import { AuthHeader } from "./auth-shell"
import { PasswordInput } from "./password-input"
import { SocialButtons } from "./social-buttons"
import { emailError, messageOf, PASSWORD_MINIMUM, passwordError } from "./validate"

type Values = { name: string; email: string; password: string }
type Errors = Partial<Record<keyof Values, string>>

export function SignUpForm() {
  const router = useRouter()
  const [values, setValues] = useState<Values>({ name: "", email: "", password: "" })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string>()
  const [pending, setPending] = useState(false)

  function update(field: keyof Values) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found: Errors = {
      name: values.name.trim() ? undefined : "Enter your name.",
      email: emailError(values.email),
      password: passwordError(values.password),
    }
    setErrors(found)
    setFormError(undefined)
    const first = (Object.keys(found) as (keyof Values)[]).find((key) => found[key])
    if (first) {
      event.currentTarget.querySelector<HTMLElement>(`#sign-up-${first}`)?.focus()
      return
    }
    setPending(true)
    try {
      const name = values.name.trim()
      await authClient.signUp({ name, email: values.email.trim(), password: values.password, workspace: `${name.split(" ")[0]}'s workspace` })
      router.push("/")
    } catch (error) {
      setFormError(messageOf(error))
      setPending(false)
    }
  }

  return (
    <>
      <AuthHeader
        title="Create your account"
        description={
          <>
            Already have one?{" "}
            <Link href="/sign-in" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
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
          <Field data-invalid={!!errors.name || undefined}>
            <FieldLabel htmlFor="sign-up-name">Full name</FieldLabel>
            <Input
              id="sign-up-name"
              name="name"
              autoComplete="name"
              autoFocus
              className="h-9"
              value={values.name}
              onChange={update("name")}
              aria-invalid={!!errors.name || undefined}
              aria-describedby={errors.name ? "sign-up-name-error" : undefined}
            />
            <FieldError id="sign-up-name-error">{errors.name}</FieldError>
          </Field>
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor="sign-up-email">Work email</FieldLabel>
            <Input
              id="sign-up-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className="h-9"
              value={values.email}
              onChange={update("email")}
              aria-invalid={!!errors.email || undefined}
              aria-describedby={errors.email ? "sign-up-email-error" : undefined}
            />
            <FieldError id="sign-up-email-error">{errors.email}</FieldError>
          </Field>
          <Field data-invalid={!!errors.password || undefined}>
            <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
            <PasswordInput
              id="sign-up-password"
              name="password"
              autoComplete="new-password"
              value={values.password}
              onChange={update("password")}
              aria-invalid={!!errors.password || undefined}
              aria-describedby={errors.password ? "sign-up-password-error sign-up-password-strength" : "sign-up-password-hint sign-up-password-strength"}
            />
            <StrengthMeter id="sign-up-password-strength" password={values.password} />
            {errors.password ? (
              <FieldError id="sign-up-password-error">{errors.password}</FieldError>
            ) : (
              <FieldDescription id="sign-up-password-hint">At least {PASSWORD_MINIMUM} characters. A short phrase is stronger than a clever word.</FieldDescription>
            )}
          </Field>
          <Button type="submit" size="lg" className="h-9 w-full" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? "Creating account" : "Create account"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Use an address ending in <span className="font-mono">@taken.example</span> to see the error state.
          </p>
        </FieldGroup>
      </form>
    </>
  )
}
