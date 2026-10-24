"use client"

import { useState } from "react"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { APP_HEIGHT, useMediaQuery } from "@/features/mail/use-media-query"
import { cn } from "@/lib/utils"

import { ConversationList } from "./conversation-list"
import { useChat } from "./store"
import { Thread } from "./thread"

/**
 * Chat: conversations and the open thread side by side from 1024px, one at a
 * time below (the thread has a Back button). Sending appends locally and the
 * demo answers after a short typing pause.
 */
export function ChatApp() {
  const split = useMediaQuery("(min-width: 1024px)")
  const [threadOpen, setThreadOpen] = useState(false)
  const selectedId = useChat((state) => state.selectedId)
  const conversation = useChat((state) => state.conversations.find((candidate) => candidate.id === state.selectedId))
  const select = useChat((state) => state.select)

  const open = (id: string) => {
    select(id)
    setThreadOpen(true)
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl bg-card shadow-(--surface-shadow)", APP_HEIGHT)}>
      {split ? (
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          <ResizablePanel id="conversations" defaultSize="30%" minSize="280px" maxSize="42%">
            <ConversationList selectedId={selectedId} onSelect={open} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id="thread" minSize="45%">
            {conversation && <Thread conversation={conversation} />}
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : threadOpen && conversation ? (
        <Thread conversation={conversation} onBack={() => setThreadOpen(false)} />
      ) : (
        <ConversationList selectedId={null} onSelect={open} />
      )}
    </div>
  )
}
