import type { DataAdapter, ResourceMap } from "./adapter"
import { NotFoundError } from "./adapter"
import { applyListQuery, type ListConfig } from "./list"
import { shouldBeEmpty, simulate } from "./simulate"

export interface MemoryAdapterOptions<R extends ResourceMap> {
  /** The seeded dataset: one array per resource. Copied, so the seed stays untouched. */
  seed: { [K in keyof R]: R[K][] }
  /** Search, filters and sorts per resource, for `list`. Resources without one only page. */
  lists?: { [K in keyof R]?: ListConfig<R[K]> }
  /**
   * Custom actions per resource. Each gets the live tables, so it can change
   * several resources at once (fulfil an order and move stock, say).
   */
  actions?: { [K in keyof R]?: Record<string, (payload: unknown, tables: { [T in keyof R]: R[T][] }) => unknown | Promise<unknown>> }
  /** New ids for `create` without one. Default: `<resource>_<n>`. Never Math.random: ids show on screen. */
  newId?: (resource: keyof R & string) => string
  /** Honour the demo switches (?latency, ?fail, ?empty). Default true. */
  simulate?: boolean
}

/**
 * An in-browser adapter over a seeded dataset: the demo runs as a static site
 * with no backend, and mutations are real until the page reloads.
 */
export function createMemoryAdapter<R extends ResourceMap>(options: MemoryAdapterOptions<R>): DataAdapter<R> {
  const tables = Object.fromEntries(Object.entries(options.seed).map(([name, rows]) => [name, (rows as { id: string }[]).map((row) => ({ ...row }))])) as {
    [K in keyof R]: R[K][]
  }
  // The highest `<resource>_<n>` in use per resource, so a default id never collides with the seed.
  const counters = new Map<string, number>()
  const suffix = (resource: string, id: string) => {
    const rest = id.startsWith(`${resource}_`) ? id.slice(resource.length + 1) : ""
    return /^\d+$/.test(rest) ? Number(rest) : 0
  }
  const bump = (resource: string, id: string) => counters.set(resource, Math.max(counters.get(resource) ?? 0, suffix(resource, id)))
  for (const [resource, rows] of Object.entries(tables) as [string, { id: string }[]][]) {
    for (const row of rows) {
      bump(resource, row.id)
    }
  }
  const newId =
    options.newId ??
    ((resource: string) => {
      const next = (counters.get(resource) ?? 0) + 1
      counters.set(resource, next)
      return `${resource}_${next}`
    })
  const wait = async (resource: string) => {
    if (options.simulate !== false) {
      await simulate(resource)
    }
  }
  const table = <K extends keyof R>(resource: K): R[K][] => {
    const rows = tables[resource]
    if (!rows) {
      throw new Error(`Unknown resource "${String(resource)}".`)
    }
    return rows
  }
  const find = <K extends keyof R & string>(resource: K, id: string) => {
    const index = table(resource).findIndex((row) => row.id === id)
    if (index === -1) {
      throw new NotFoundError(resource, id)
    }
    return index
  }

  return {
    async list(resource, query) {
      await wait(resource)
      const rows = options.simulate !== false && shouldBeEmpty(resource) ? [] : table(resource)
      const config = options.lists?.[resource] ?? { searchText: (row: R[typeof resource]) => JSON.stringify(row).toLowerCase() }
      return structuredClone(applyListQuery(rows, query, config))
    },
    async get(resource, id) {
      await wait(resource)
      return structuredClone(table(resource)[find(resource, id)])
    },
    async create(resource, input) {
      await wait(resource)
      const rows = table(resource)
      const id = input.id ?? newId(resource)
      // Checked on the final id, so a custom newId that repeats is caught too.
      if (rows.some((row) => row.id === id)) {
        throw new Error(`A ${resource} with id "${id}" already exists.`)
      }
      const record = { ...input, id } as unknown as R[typeof resource]
      bump(resource, record.id)
      rows.unshift(record)
      return structuredClone(record)
    },
    async update(resource, id, patch) {
      await wait(resource)
      const rows = table(resource)
      const index = find(resource, id)
      rows[index] = { ...rows[index], ...patch, id }
      return structuredClone(rows[index])
    },
    async remove(resource, id) {
      await wait(resource)
      table(resource).splice(find(resource, id), 1)
    },
    async action(resource, name, payload) {
      await wait(resource)
      const handler = options.actions?.[resource]?.[name]
      if (!handler) {
        throw new Error(`No action "${name}" on "${resource}".`)
      }
      return structuredClone(await handler(payload, tables)) as never
    },
  }
}
