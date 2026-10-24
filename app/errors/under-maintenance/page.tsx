import type { Metadata } from "next"
import { WrenchIcon } from "lucide-react"

import { ErrorScreen } from "../error-screen"

export const metadata: Metadata = { title: "Down for maintenance" }

export default function Page() {
  return (
    <ErrorScreen
      code={<WrenchIcon className="size-14" aria-hidden />}
      title="Down for maintenance"
      description="Chronicle is getting a scheduled upgrade and will be back within the hour. Your data is safe."
    />
  )
}
