import type { Metadata } from "next"

import { ErrorScreen } from "../error-screen"

export const metadata: Metadata = { title: "Page not found" }

export default function Page() {
  return (
    <ErrorScreen
      code="404"
      title="Page not found"
      description="We could not find that page. It may have moved, or the link may be mistyped."
    />
  )
}
