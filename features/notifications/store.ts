import { create } from "zustand"

import { workspace } from "@/data/generate"
import { formatMoney } from "@/kit/data/format"
import type { InboxNotification } from "@/kit/notifications/notifications-inbox"

/**
 * Notifications come from the workspace's own activity feed, so a "payment
 * failed" alert names an account you can open on the Users page. The newest
 * six start unread.
 */
function seedNotifications(): InboxNotification[] {
  return workspace()
    .activity.slice(0, 24)
    .map((entry, index) => {
      const title =
        entry.kind === "payment_failed"
          ? `Payment failed: ${entry.accountName}`
          : entry.kind === "churn"
            ? `${entry.accountName} cancelled`
            : entry.kind === "upgrade"
              ? `${entry.accountName} added seats`
              : entry.kind === "downgrade"
                ? `${entry.accountName} removed a seat`
                : `${entry.accountName} started paying`
      const money = entry.mrrDeltaCents === 0 ? "" : ` (${entry.mrrDeltaCents > 0 ? "+" : "-"}${formatMoney(Math.abs(entry.mrrDeltaCents))} MRR)`
      return {
        id: entry.id,
        title,
        body: `${entry.detail}${money}`,
        // A cancelled account has no users left, so its alert opens Analytics instead.
        href: entry.kind === "churn" ? "/analytics" : `/users?account=${entry.accountId}`,
        read: index >= 6,
        at: entry.at,
        category: entry.kind === "payment_failed" || entry.kind === "churn" ? "risk" : "revenue",
      }
    })
}

interface NotificationState {
  items: InboxNotification[]
  markRead: (ids: string[] | "all") => void
}

export const useNotifications = create<NotificationState>((set) => ({
  items: seedNotifications(),
  markRead: (ids) => set((state) => ({ items: state.items.map((item) => (ids === "all" || ids.includes(item.id) ? { ...item, read: true } : item)) })),
}))
