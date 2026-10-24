"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createContext, useContext } from "react"

import { toast } from "@/components/ui/toast"

import type { DataAdapter, ResourceMap } from "./adapter"
import type { ListQuery } from "./list"

/**
 * TanStack Query hooks over a `DataAdapter`. Query keys start with "kit" and
 * the resource name, so a mutation invalidates exactly what it can change.
 */

const AdapterContext = createContext<DataAdapter<ResourceMap> | null>(null)

/**
 * Makes `adapter` available to the hooks below. Put it inside `QueryProvider`.
 * Render it from a client component that imports the adapter: an adapter is
 * functions, which a server layout cannot pass to a client component.
 */
export function DataProvider<R extends ResourceMap>({ adapter, children }: { adapter: DataAdapter<R>; children: React.ReactNode }) {
  return <AdapterContext.Provider value={adapter as unknown as DataAdapter<ResourceMap>}>{children}</AdapterContext.Provider>
}

export function useAdapter<R extends ResourceMap>(): DataAdapter<R> {
  const adapter = useContext(AdapterContext)
  if (!adapter) {
    throw new Error("useAdapter must be used inside DataProvider.")
  }
  return adapter as unknown as DataAdapter<R>
}

export const dataKeys = {
  resource: (resource: string) => ["kit", resource] as const,
  list: (resource: string, query: ListQuery) => ["kit", resource, "list", query] as const,
  record: (resource: string, id: string) => ["kit", resource, "record", id] as const,
}

/** One page of a resource. Keeps the previous page on screen while the next loads. */
export function useList<R extends ResourceMap, K extends keyof R & string>(resource: K, query: ListQuery) {
  const adapter = useAdapter<R>()
  return useQuery({ queryKey: dataKeys.list(resource, query), queryFn: () => adapter.list(resource, query), placeholderData: keepPreviousData })
}

/** One record; idle while `id` is null (a detail route before its id is known). */
export function useRecord<R extends ResourceMap, K extends keyof R & string>(resource: K, id: string | null) {
  const adapter = useAdapter<R>()
  return useQuery({ queryKey: dataKeys.record(resource, id ?? ""), queryFn: () => adapter.get(resource, id!), enabled: id !== null })
}

export interface MutationFeedback<Input, Output> {
  /** Toast on success, built from the result. */
  success?: (output: Output, input: Input) => { title: string; description?: string }
  /** Toast title on failure; the error message is the description. */
  error?: string
}

/**
 * A mutation with its toasts and cache refresh built in. Feedback lives here,
 * not in `mutate()` callbacks: TanStack drops per-call callbacks once the
 * calling component unmounts, which silently loses "Saved" and "Undo" toasts.
 * `invalidate` lists the resources to refetch; omit it to refetch everything.
 */
export function useKitMutation<Input, Output>(
  run: (input: Input) => Promise<Output>,
  feedback?: MutationFeedback<Input, Output> & { invalidate?: string[] }
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: run,
    onSuccess: (output, input) => {
      if (feedback?.success) {
        toast.add({ type: "success", ...feedback.success(output, input) })
      }
      const resources = feedback?.invalidate
      return resources ? Promise.all(resources.map((resource) => client.invalidateQueries({ queryKey: dataKeys.resource(resource) }))) : client.invalidateQueries()
    },
    onError: (error) => {
      if (feedback?.error) {
        toast.add({ type: "error", title: feedback.error, description: error.message })
      }
    },
  })
}
