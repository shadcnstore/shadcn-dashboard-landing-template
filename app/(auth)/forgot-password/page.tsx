import type { Metadata } from "next"

import { ForgotPasswordForm } from "@/features/auth/forgot-password-form"

export const metadata: Metadata = { title: "Reset your password" }

export default function Page() {
  return <ForgotPasswordForm />
}
