import type { Metadata } from "next"

import { ChatApp } from "@/features/chat/chat-app"

export const metadata: Metadata = { title: "Chat" }

export default function Page() {
  return <ChatApp />
}
