"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { FieldSeparator } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/kit/auth/auth-client"
import { AppleMark, GoogleMark } from "@/kit/auth/brand-marks"

type Provider = "google" | "apple"

const PROVIDERS: { id: Provider; label: string; mark: React.ReactNode }[] = [
  { id: "google", label: "Google", mark: <GoogleMark /> },
  { id: "apple", label: "Apple", mark: <AppleMark /> },
]

/** Google and Apple sign-in, then an "or" rule above the email form. */
export function SocialButtons({ disabled, onError }: { disabled?: boolean; onError: (message: string) => void }) {
  const router = useRouter()
  const [pending, setPending] = useState<Provider | null>(null)

  async function signIn(provider: Provider) {
    setPending(provider)
    try {
      await authClient.signInWith(provider)
      router.push("/")
    } catch (error) {
      onError(error instanceof Error ? error.message : "That did not work. Try again.")
      setPending(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {PROVIDERS.map((provider) => (
          <Button key={provider.id} type="button" variant="outline" className="h-9" disabled={disabled || pending !== null} onClick={() => signIn(provider.id)}>
            {pending === provider.id ? <Spinner data-icon="inline-start" /> : provider.mark}
            {provider.label}
          </Button>
        ))}
      </div>
      <FieldSeparator className="my-6">or with email</FieldSeparator>
    </>
  )
}
