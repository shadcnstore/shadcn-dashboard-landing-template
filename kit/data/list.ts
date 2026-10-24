/**
 * The shape of every list request and response, and an in-memory
 * implementation that mock data layers use. A real API receives the same
 * `ListQuery` and returns the same `ListResult`.
 */

export interface SortRule {
  id: string
  desc: boolean
}

export type FilterValue = string | string[] | undefined

export interface ListQuery {
  page?: number
  pageSize?: number
  search?: string
  sort?: SortRule[]
  filters?: Record<string, FilterValue>
}

export interface ListResult<T> {
  rows: T[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export interface ListConfig<T> {
  /** Text the search box matches against, lower-cased. */
  searchText: (row: T) => string
  /** Filter id → predicate. Filters with no value are skipped. */
  filters?: Record<string, (row: T, value: string[]) => boolean>
  /** Sort id → comparable value. */
  sortValues?: Record<string, (row: T) => string | number | null>
  defaultSort?: SortRule[]
}

export const DEFAULT_PAGE_SIZE = 20

function asList(value: FilterValue): string[] {
  if (value === undefined || value === "") {
    return []
  }
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

export function applyListQuery<T>(rows: T[], query: ListQuery, config: ListConfig<T>): ListResult<T> {
  let result = rows

  const search = query.search?.trim().toLowerCase()
  if (search) {
    const terms = search.split(/\s+/)
    result = result.filter((row) => {
      const text = config.searchText(row)
      return terms.every((term) => text.includes(term))
    })
  }

  for (const [id, raw] of Object.entries(query.filters ?? {})) {
    const values = asList(raw)
    const predicate = config.filters?.[id]
    if (values.length > 0 && predicate) {
      result = result.filter((row) => predicate(row, values))
    }
  }

  const sort = query.sort && query.sort.length > 0 ? query.sort : (config.defaultSort ?? [])
  if (sort.length > 0 && config.sortValues) {
    result = [...result].sort((a, b) => {
      for (const rule of sort) {
        const value = config.sortValues?.[rule.id]
        if (!value) {
          continue
        }
        const left = value(a)
        const right = value(b)
        if (left === right) {
          continue
        }
        if (left === null) {
          return 1
        }
        if (right === null) {
          return -1
        }
        const order = left < right ? -1 : 1
        return rule.desc ? -order : order
      }
      return 0
    })
  }

  const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE)
  const pageCount = Math.max(1, Math.ceil(result.length / pageSize))
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount)
  return {
    rows: result.slice((page - 1) * pageSize, page * pageSize),
    total: result.length,
    page,
    pageSize,
    pageCount,
  }
}
