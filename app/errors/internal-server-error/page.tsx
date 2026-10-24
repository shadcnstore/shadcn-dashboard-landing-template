import type { Metadata } from "next"

import { ErrorScreen } from "../error-screen"

export const metadata: Metadata = { title: "Something went wrong" }

export default function Page() {
  return (
    <ErrorScreen
      code="500"
      title="Something went wrong"
      description="An error on our side stopped this page from loading. It has been logged. Try again in a moment."
    />
  )
}
