import type { Metadata } from "next"

import { ErrorScreen } from "../error-screen"

export const metadata: Metadata = { title: "Sign in to continue" }

export default function Page() {
  return (
    <ErrorScreen
      code="401"
      title="Sign in to continue"
      description="Your session has ended or you are not signed in. Sign in again to pick up where you left off."
      secondary={{ label: "Sign in", href: "/sign-in" }}
    />
  )
}
