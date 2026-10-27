import type { Metadata } from "next"

import { AuthFrame } from "@/features/auth/auth-shell"
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form"

export const metadata: Metadata = { title: "Reset your password" }

export default function Page() {
  return (
    <AuthFrame variant={1}>
      <ForgotPasswordForm />
    </AuthFrame>
  )
}
