import type { Metadata } from "next"

import { ErrorScreen } from "../error-screen"

export const metadata: Metadata = { title: "No access" }

export default function Page() {
  return (
    <ErrorScreen
      code="403"
      title="No access"
      description="Your role does not include this page. Ask a workspace owner if you need access."
      secondary={{ label: "Switch account", href: "/sign-in" }}
    />
  )
}
