import type { Metadata } from "next"

import { SignUpForm } from "@/features/auth/sign-up-form"

export const metadata: Metadata = { title: "Create an account" }

export default function Page() {
  return <SignUpForm />
}
