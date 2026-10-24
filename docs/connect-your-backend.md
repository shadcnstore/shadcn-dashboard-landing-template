# Connect your backend

Every screen reads and writes through one **data adapter**, defined in `lib/data.ts`. In the template it is the Kit's in-memory adapter over the Tidewell sample data, so the app runs with no server. Your edits last until you reload.

## The contract

An adapter is an object with six methods (`kit/data/adapter.ts`):

| Method | Called for |
|---|---|
| `list(resource, query)` | Tables and lists. `query` has `page`, `pageSize`, `search`, `sort` and `filters`; return `{ rows, total, page, pageSize, pageCount }` |
| `get(resource, id)` | Detail pages and sheets. Throw `NotFoundError` when there is no such record |
| `create(resource, input)` | Forms that add a record |
| `update(resource, id, patch)` | Inline edits and forms |
| `remove(resource, id)` | Deletes |
| `action(resource, name, payload)` | Anything else, such as `users.setRole` or `tasks.move` |

Resources are typed once: `type Resources = { users: User; accounts: Account; tasks: Task }`. Records need a string `id`; money is integer cents; dates are ISO strings.

## Going live

Write an adapter that calls your API and export it from `lib/data.ts` instead of the memory one:

```ts
import type { DataAdapter } from "@/kit/data/adapter"
import { NotFoundError } from "@/kit/data/adapter"

export const adapter: DataAdapter<Resources> = {
  async list(resource, query) {
    const response = await fetch(`/api/${resource}?${new URLSearchParams({ q: query.search ?? "", page: String(query.page ?? 1) })}`)
    return response.json()
  },
  async get(resource, id) {
    const response = await fetch(`/api/${resource}/${id}`)
    if (response.status === 404) throw new NotFoundError(resource, id)
    return response.json()
  },
  // create, update, remove and action the same way
}
```

Screens use the Kit hooks, which wrap TanStack Query, so loading states, caching, refetching and toasts after a change already work:

```ts
const users = useList<Resources, "users">("users", { search: "ada", pageSize: 20 })
const save = useKitMutation((patch) => adapter.update("users", id, patch), { success: () => ({ title: "Saved" }), invalidate: ["users"] })
```

## Trying the states

Add these to any address to see how a screen handles a slow or broken backend: `?latency=800` (or `?latency=on`), `?fail=1`, `?empty=1`.

## Charts

The Overview and Analytics read the whole sample workspace (`data/generate.ts`) because they are aggregates. With your own backend, compute those figures on the server and return them from an endpoint; keep the same shapes and the widgets do not change.
