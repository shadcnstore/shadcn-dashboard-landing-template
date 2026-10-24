import type { Metadata } from "next"
import { Suspense } from "react"

import { TasksPage } from "@/features/tasks/tasks-page"

export const metadata: Metadata = { title: "Tasks" }

export default function Page() {
  return (
    <Suspense>
      <TasksPage />
    </Suspense>
  )
}
