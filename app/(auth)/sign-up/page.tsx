import type { Metadata } from "next"

import { AuthFrame } from "@/features/auth/auth-shell"
import { SignUpForm } from "@/features/auth/sign-up-form"

export const metadata: Metadata = { title: "Create an account" }

export default function Page() {
  return (
    <AuthFrame variant={1}>
      <SignUpForm />
    </AuthFrame>
  )
}
