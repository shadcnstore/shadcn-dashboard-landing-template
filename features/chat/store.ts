"use client"

import { create } from "zustand"

import { currentTime } from "@/lib/clock"

import { AUTO_REPLIES, CONVERSATIONS, ME_ID, type Conversation } from "./data"

interface ChatState {
  conversations: Conversation[]
  selectedId: string
  query: string
  /** Conversation ids where the other side is "typing" a demo reply. */
  typing: string[]
  select: (id: string) => void
  setQuery: (query: string) => void
  send: (conversationId: string, text: string) => void
  togglePinned: (id: string) => void
  toggleMuted: (id: string) => void
}

let sequence = 0

function append(conversations: Conversation[], id: string, senderId: string, text: string): Conversation[] {
  sequence += 1
  return conversations.map((conversation) =>
    conversation.id === id ? { ...conversation, messages: [...conversation.messages, { id: `${id}_new_${sequence}`, senderId, text, sentAt: currentTime().toISOString() }] } : conversation
  )
}

export const useChat = create<ChatState>((set, get) => ({
  conversations: CONVERSATIONS.map((conversation) => (conversation.id === "c_renewals" ? { ...conversation, unread: 0 } : conversation)),
  selectedId: "c_renewals",
  query: "",
  typing: [],
  select: (id) => set((state) => ({ selectedId: id, conversations: state.conversations.map((conversation) => (conversation.id === id ? { ...conversation, unread: 0 } : conversation)) })),
  setQuery: (query) => set({ query }),
  send: (conversationId, text) => {
    set((state) => ({ conversations: append(state.conversations, conversationId, ME_ID, text) }))
    // The demo answers once, from someone else in the conversation, after a short "typing" pause.
    const conversation = get().conversations.find((candidate) => candidate.id === conversationId)
    const responder = conversation?.memberIds.find((memberId) => memberId !== ME_ID)
    if (!conversation || !responder || get().typing.includes(conversationId)) {
      return
    }
    const reply = AUTO_REPLIES[conversation.messages.length % AUTO_REPLIES.length]
    setTimeout(() => set((state) => ({ typing: [...state.typing, conversationId] })), 600)
    setTimeout(() => {
      set((state) => ({
        typing: state.typing.filter((id) => id !== conversationId),
        conversations: append(state.conversations, conversationId, responder, reply).map((candidate) =>
          candidate.id === conversationId && state.selectedId !== conversationId ? { ...candidate, unread: candidate.unread + 1 } : candidate
        ),
      }))
    }, 2200)
  },
  togglePinned: (id) => set((state) => ({ conversations: state.conversations.map((conversation) => (conversation.id === id ? { ...conversation, pinned: !conversation.pinned } : conversation)) })),
  toggleMuted: (id) => set((state) => ({ conversations: state.conversations.map((conversation) => (conversation.id === id ? { ...conversation, muted: !conversation.muted } : conversation)) })),
}))
