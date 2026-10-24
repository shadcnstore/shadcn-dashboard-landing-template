import { create } from "zustand"

import { SITE } from "@/config/site"

/**
 * Saved settings for the demo. They live in memory, so they last until a
 * reload, like the rest of the sample data. With a backend, load them with
 * `useRecord` and save them with `useKitMutation` instead.
 */

export interface Profile {
  name: string
  email: string
  title: string
  bio: string
  /** One or two letters; empty means "from my name". */
  initials: string
}

export type Channel = "email" | "inApp" | "mobile"
export type AlertKind =
  | "newPaying"
  | "expansion"
  | "contraction"
  | "paymentFailed"
  | "churn"
  | "seatLimit"
  | "taskAssigned"
  | "weeklyDigest"

export interface NotificationPrefs {
  channels: Record<Channel, Record<AlertKind, boolean>>
  /** Hold mobile pushes overnight, in the user's time zone. */
  quietHours: boolean
}

const all = (
  value: boolean,
  overrides: Partial<Record<AlertKind, boolean>> = {}
): Record<AlertKind, boolean> => ({
  newPaying: value,
  expansion: value,
  contraction: value,
  paymentFailed: value,
  churn: value,
  seatLimit: value,
  taskAssigned: value,
  weeklyDigest: value,
  ...overrides,
})

export const DEFAULT_PREFS: NotificationPrefs = {
  channels: {
    email: all(false, { paymentFailed: true, churn: true, weeklyDigest: true }),
    inApp: all(true, { weeklyDigest: false }),
    mobile: all(false, { paymentFailed: true, churn: true }),
  },
  quietHours: true,
}

interface SettingsState {
  profile: Profile
  notifications: NotificationPrefs
  saveProfile: (profile: Profile) => void
  saveNotifications: (prefs: NotificationPrefs) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  profile: {
    name: SITE.user.name,
    email: SITE.user.email,
    title: "Head of Operations",
    bio: "I look after billing, renewals and the accounts that need a hand. Ping me about anything past due.",
    initials: "",
  },
  notifications: DEFAULT_PREFS,
  saveProfile: (profile) => set({ profile }),
  saveNotifications: (notifications) => set({ notifications }),
}))
