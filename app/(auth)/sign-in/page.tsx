import type { Metadata } from "next"

import { AuthFrame } from "@/features/auth/auth-shell"
import { SignInForm } from "@/features/auth/sign-in-form"

export const metadata: Metadata = { title: "Sign in" }

export default function Page() {
  return (
    <AuthFrame variant={1}>
      <SignInForm />
    </AuthFrame>
  )
}
