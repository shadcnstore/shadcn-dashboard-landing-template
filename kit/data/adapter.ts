import type { ListQuery, ListResult } from "./list"

/**
 * The data contract between Kit screens and a backend. A template declares
 * its resources once:
 *
 *   type Resources = { deals: Deal; contacts: Contact }
 *
 * and every screen reads and writes through a `DataAdapter<Resources>`. The
 * demo uses `createMemoryAdapter` over a seeded dataset; going live means
 * writing one object with these six methods against REST, GraphQL or an SDK.
 * Records need a string `id`. Money is integer cents, dates ISO strings.
 */

export type ResourceMap = Record<string, { id: string }>

export interface DataAdapter<R extends ResourceMap> {
  list<K extends keyof R & string>(resource: K, query: ListQuery): Promise<ListResult<R[K]>>
  /** Rejects with `NotFoundError` when there is no such record. */
  get<K extends keyof R & string>(resource: K, id: string): Promise<R[K]>
  create<K extends keyof R & string>(resource: K, input: Omit<R[K], "id"> & { id?: string }): Promise<R[K]>
  update<K extends keyof R & string>(resource: K, id: string, patch: Partial<Omit<R[K], "id">>): Promise<R[K]>
  remove<K extends keyof R & string>(resource: K, id: string): Promise<void>
  /** Anything that is not plain CRUD: "fulfil", "merge", "send". */
  action<Output = unknown>(resource: keyof R & string, name: string, payload?: unknown): Promise<Output>
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`No ${resource} with id "${id}".`)
    this.name = "NotFoundError"
  }
}
