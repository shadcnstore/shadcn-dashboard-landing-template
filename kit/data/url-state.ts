"use client"

import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { useCallback, useEffect, useMemo, useState } from "react"

import { DEFAULT_PAGE_SIZE, type ListQuery, type SortRule } from "./list"

/**
 * List state that lives in the address: `?q=ridge&status=unfulfilled,partial&sort=-total&page=2`.
 * A filtered view survives a reload, works with Back, and can be shared as a
 * link. Every list screen uses this, then passes `query` to its data hook.
 */

/** Everything a saved view restores. Page is left out on purpose. */
export interface ListSnapshot {
  search: string
  sort: string
  filters: Record<string, string[]>
}

export const PAGE_SIZES = [10, 20, 50, 100] as const

const SEARCH_DELAY = 300

function parseSort(value: string): SortRule[] {
  return value
    .split(",")
    .filter(Boolean)
    .map((part) => (part.startsWith("-") ? { id: part.slice(1), desc: true } : { id: part, desc: false }))
}

export function formatSort(rules: SortRule[]): string {
  return rules.map((rule) => `${rule.desc ? "-" : ""}${rule.id}`).join(",")
}

export function useListState<F extends string>({
  filters: filterKeys,
  defaultSort,
  pageSize: defaultPageSize = DEFAULT_PAGE_SIZE,
}: {
  /** Filter ids this list accepts; each becomes its own address parameter. */
  filters: readonly F[]
  /** The sort when the address has none, e.g. `"-date"`. */
  defaultSort: string
  pageSize?: number
}) {
  const parsers = useMemo(() => {
    const filterParsers = Object.fromEntries(filterKeys.map((key) => [key, parseAsArrayOf(parseAsString).withDefault([])])) as Record<
      F,
      ReturnType<typeof parseAsArrayOf<string>> & { readonly defaultValue: string[] }
    >
    return {
      q: parseAsString.withDefault(""),
      sort: parseAsString.withDefault(defaultSort),
      page: parseAsInteger.withDefault(1),
      size: parseAsInteger.withDefault(defaultPageSize),
      ...filterParsers,
    }
    // The keys are fixed for the life of a screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [state, setState] = useQueryStates(parsers)
  const values = state as unknown as { q: string; sort: string; page: number; size: number } & Record<F, string[]>

  // The box updates at once; the address (and the request) after a pause.
  const [searchInput, setSearchInput] = useState(values.q)
  useEffect(() => {
    if (searchInput === values.q) {
      return
    }
    const timer = setTimeout(() => setState({ q: searchInput || null, page: null } as never), SEARCH_DELAY)
    return () => clearTimeout(timer)
  }, [searchInput, values.q, setState])

  // A stable object while the filter values are the same, so queries keyed on it do not refetch.
  const filtersKey = JSON.stringify(filterKeys.map((key) => values[key]))
  const filters = useMemo(
    () => Object.fromEntries(filterKeys.map((key, index) => [key, (JSON.parse(filtersKey) as string[][])[index]])) as unknown as Record<F, string[]>,
    [filterKeys, filtersKey]
  )

  const sort = useMemo(() => parseSort(values.sort), [values.sort])

  const query = useMemo<ListQuery>(
    () => ({ search: values.q, sort, page: values.page, pageSize: values.size, filters }),
    [values.q, sort, values.page, values.size, filters]
  )

  const setFilter = useCallback(
    (key: F, next: string[]) => setState({ [key]: next.length > 0 ? next : null, page: null } as never),
    [setState]
  )

  const clearFilters = useCallback(
    () => {
      setSearchInput("")
      setState({ q: null, page: null, ...Object.fromEntries(filterKeys.map((key) => [key, null])) } as never)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setState]
  )

  const snapshot = useMemo<ListSnapshot>(() => ({ search: values.q, sort: values.sort, filters }), [values.q, values.sort, filters])

  const applySnapshot = useCallback(
    (next: ListSnapshot) => {
      setSearchInput(next.search)
      setState({
        q: next.search || null,
        sort: next.sort === defaultSort ? null : next.sort,
        page: null,
        ...Object.fromEntries(filterKeys.map((key) => [key, next.filters[key]?.length ? next.filters[key] : null])),
      } as never)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setState, defaultSort]
  )

  const activeFilterCount = filterKeys.filter((key) => values[key].length > 0).length + (values.q ? 1 : 0)

  return {
    query,
    searchInput,
    setSearch: setSearchInput,
    sort,
    setSort: (rules: SortRule[]) => setState({ sort: rules.length > 0 ? formatSort(rules) : null, page: null } as never),
    page: values.page,
    setPage: (page: number) => setState({ page: page > 1 ? page : null } as never),
    pageSize: values.size,
    setPageSize: (size: number) => setState({ size: size === defaultPageSize ? null : size, page: null } as never),
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    snapshot,
    applySnapshot,
  }
}

/** Two snapshots describe the same view (filter order does not matter). */
export function sameSnapshot(a: ListSnapshot, b: ListSnapshot): boolean {
  if (a.search !== b.search || a.sort !== b.sort) {
    return false
  }
  const keys = new Set([...Object.keys(a.filters), ...Object.keys(b.filters)])
  for (const key of keys) {
    const left = [...(a.filters[key] ?? [])].sort().join("|")
    const right = [...(b.filters[key] ?? [])].sort().join("|")
    if (left !== right) {
      return false
    }
  }
  return true
}
