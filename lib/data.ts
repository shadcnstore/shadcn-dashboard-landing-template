import { workspace } from "@/data/generate"
import type { Account, Task, TaskStatus, User, UserRole } from "@/data/schema"
import { createMemoryAdapter } from "@/kit/data/memory-adapter"

/**
 * Every screen reads and writes through this adapter. Today it is the Kit's
 * in-memory adapter over the Chronicle sample data, so the demo runs with no
 * backend and edits last until you reload. To go live, replace it with an
 * object that has the same six methods (list, get, create, update, remove,
 * action) calling your API: see docs/connect-your-backend.md.
 */
export type Resources = { users: User; accounts: Account; tasks: Task }

const PREFIX: Record<keyof Resources, string> = { users: "usr", accounts: "acc", tasks: "tsk" }

const seed = workspace()
const highest = Object.fromEntries(
  (Object.keys(PREFIX) as (keyof Resources)[]).map((resource) => [resource, Math.max(0, ...seed[resource].map((row) => Number(row.id.split("_")[1]) || 0))])
) as Record<keyof Resources, number>

export const adapter = createMemoryAdapter<Resources>({
  seed: { users: seed.users, accounts: seed.accounts, tasks: seed.tasks },
  newId: (resource) => {
    highest[resource] += 1
    return `${PREFIX[resource]}_${String(highest[resource]).padStart(resource === "users" ? 5 : resource === "accounts" ? 4 : 3, "0")}`
  },
  lists: {
    users: {
      searchText: (user) => `${user.name} ${user.email} ${user.accountName}`.toLowerCase(),
      filters: {
        role: (user, values) => values.includes(user.role),
        status: (user, values) => values.includes(user.status),
        plan: (user, values) => values.includes(user.plan),
        account: (user, values) => values.includes(user.accountId),
      },
      sortValues: {
        name: (user) => user.name.toLowerCase(),
        accountName: (user) => user.accountName.toLowerCase(),
        role: (user) => ["owner", "admin", "member", "viewer"].indexOf(user.role),
        createdAt: (user) => user.createdAt,
        lastSeenAt: (user) => user.lastSeenAt ?? "",
      },
      defaultSort: [{ id: "lastSeenAt", desc: true }],
    },
    accounts: {
      searchText: (account) => `${account.name} ${account.domain} ${account.industry}`.toLowerCase(),
      filters: {
        plan: (account, values) => values.includes(account.plan),
        status: (account, values) => values.includes(account.status),
        attention: (account, values) =>
          values.some((value) => (value === "over-limit" ? account.seats > account.seatLimit : value === "past-due" ? account.status === "past_due" : false)),
      },
      sortValues: { name: (account) => account.name.toLowerCase(), mrrCents: (account) => account.mrrCents, seats: (account) => account.seats, startedAt: (account) => account.startedAt },
      defaultSort: [{ id: "mrrCents", desc: true }],
    },
    tasks: {
      searchText: (task) => `${task.key} ${task.title}`.toLowerCase(),
      filters: {
        status: (task, values) => values.includes(task.status),
        priority: (task, values) => values.includes(task.priority),
        label: (task, values) => values.includes(task.label),
        assignee: (task, values) => values.includes(task.assigneeId ?? "none"),
      },
      sortValues: {
        key: (task) => Number(task.key.split("-")[1]),
        priority: (task) => ["urgent", "high", "medium", "low"].indexOf(task.priority),
        due: (task) => task.due ?? "9999",
        rank: (task) => task.rank,
      },
      defaultSort: [{ id: "rank", desc: false }],
    },
  },
  actions: {
    users: {
      /** Change the role of several users at once; returns how many changed. */
      setRole: (payload, tables) => {
        const { ids, role } = payload as { ids: string[]; role: UserRole }
        if (role === "owner") {
          throw new Error("Ownership is transferred from the account page, not changed in bulk.")
        }
        let changed = 0
        for (const user of tables.users) {
          if (ids.includes(user.id) && user.role !== "owner" && user.role !== role) {
            user.role = role
            changed += 1
          }
        }
        return { changed }
      },
      /** Send the invitation again; the demo only reports it. */
      resendInvite: (payload, tables) => {
        const user = tables.users.find((candidate) => candidate.id === (payload as { id: string }).id)
        if (!user || user.status !== "invited") {
          throw new Error("Only invited users can be sent another invitation.")
        }
        return { email: user.email }
      },
    },
    tasks: {
      /** Move a task to another column at a position, renumbering both columns. */
      move: (payload, tables) => {
        const { id, status, index } = payload as { id: string; status: TaskStatus; index: number }
        const task = tables.tasks.find((candidate) => candidate.id === id)
        if (!task) {
          throw new Error("No such task.")
        }
        const from = task.status
        task.status = status
        const column = tables.tasks.filter((candidate) => candidate.status === status && candidate.id !== id).sort((a, b) => a.rank - b.rank)
        column.splice(Math.max(0, Math.min(index, column.length)), 0, task)
        column.forEach((candidate, position) => (candidate.rank = position + 1))
        if (from !== status) {
          tables.tasks
            .filter((candidate) => candidate.status === from)
            .sort((a, b) => a.rank - b.rank)
            .forEach((candidate, position) => (candidate.rank = position + 1))
        }
        return task
      },
    },
  },
})
