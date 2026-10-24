"use client"

import { create } from "zustand"

import { currentTime } from "@/lib/clock"

import { MAILS, ME, type Mail, type MailFolder, type MailLabel } from "./data"

/** "starred" is a view over every folder but trash, not a folder of its own. */
export type MailView = MailFolder | "starred"

interface MailState {
  mails: Mail[]
  view: MailView
  label: MailLabel | null
  unreadOnly: boolean
  query: string
  selectedId: string | null
  setView: (view: MailView) => void
  setLabel: (label: MailLabel | null) => void
  setUnreadOnly: (unreadOnly: boolean) => void
  setQuery: (query: string) => void
  /** Opens a message and marks it read. `null` closes the reader (mobile back). */
  select: (id: string | null) => void
  setRead: (id: string, read: boolean) => void
  toggleStar: (id: string) => void
  /** Moves a message to another folder and closes it. */
  move: (id: string, folder: MailFolder) => void
  send: (draft: { to: string; subject: string; body: string }) => void
}

let sentCount = 0

export const useMail = create<MailState>((set) => ({
  // The message open on load counts as read, like any other opened message.
  mails: MAILS.map((mail) => (mail.id === "m01" ? { ...mail, read: true } : mail)),
  view: "inbox",
  label: null,
  unreadOnly: false,
  query: "",
  selectedId: "m01",
  setView: (view) => set({ view, label: null, selectedId: null }),
  setLabel: (label) => set((state) => ({ label: state.label === label ? null : label, selectedId: null })),
  setUnreadOnly: (unreadOnly) => set({ unreadOnly }),
  setQuery: (query) => set({ query }),
  select: (id) => set((state) => ({ selectedId: id, mails: id ? state.mails.map((mail) => (mail.id === id ? { ...mail, read: true } : mail)) : state.mails })),
  setRead: (id, read) => set((state) => ({ mails: state.mails.map((mail) => (mail.id === id ? { ...mail, read } : mail)) })),
  toggleStar: (id) => set((state) => ({ mails: state.mails.map((mail) => (mail.id === id ? { ...mail, starred: !mail.starred } : mail)) })),
  move: (id, folder) => set((state) => ({ selectedId: state.selectedId === id ? null : state.selectedId, mails: state.mails.map((mail) => (mail.id === id ? { ...mail, folder } : mail)) })),
  send: ({ to, subject, body }) => {
    sentCount += 1
    const mail: Mail = {
      id: `sent_${sentCount}`,
      folder: "sent",
      from: ME,
      to,
      subject: subject || "(no subject)",
      body: body.split(/\n{2,}/),
      date: currentTime().toISOString(),
      read: true,
      starred: false,
      labels: [],
    }
    set((state) => ({ mails: [mail, ...state.mails] }))
  },
}))

/** The messages the list shows for the current view, label, tab and search. */
export function visibleMails(state: Pick<MailState, "mails" | "view" | "label" | "unreadOnly" | "query">): Mail[] {
  const query = state.query.trim().toLowerCase()
  return state.mails
    .filter((mail) => (state.view === "starred" ? mail.starred && mail.folder !== "trash" : mail.folder === state.view))
    .filter((mail) => !state.label || mail.labels.includes(state.label))
    .filter((mail) => !state.unreadOnly || !mail.read)
    .filter((mail) => !query || `${mail.from.name} ${mail.from.email} ${mail.subject} ${mail.body.join(" ")} ${mail.account?.name ?? ""}`.toLowerCase().includes(query))
    .sort((a, b) => b.date.localeCompare(a.date))
}
