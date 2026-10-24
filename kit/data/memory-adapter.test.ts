import { beforeAll, describe, expect, it } from "vitest"

import { NotFoundError } from "./adapter"
import { createMemoryAdapter } from "./memory-adapter"
import { disableSimulatedLatency } from "./simulate"

interface Deal {
  id: string
  name: string
  amount: number
  stage: "lead" | "won"
}
interface Note {
  id: string
  dealId: string
  text: string
}
type Resources = { deals: Deal; notes: Note }

const seed = {
  deals: [
    { id: "d1", name: "Harbor renewal", amount: 120000, stage: "lead" as const },
    { id: "d2", name: "Northwind pilot", amount: 45000, stage: "won" as const },
    { id: "d3", name: "Harbor expansion", amount: 300000, stage: "lead" as const },
  ],
  notes: [],
}

function adapter() {
  return createMemoryAdapter<Resources>({
    seed,
    lists: {
      deals: {
        searchText: (deal) => deal.name.toLowerCase(),
        filters: { stage: (deal, values) => values.includes(deal.stage) },
        sortValues: { amount: (deal) => deal.amount },
      },
    },
    actions: {
      deals: {
        win: (payload, tables) => {
          const deal = tables.deals.find((entry) => entry.id === (payload as { id: string }).id)!
          deal.stage = "won"
          tables.notes.push({ id: `n_${deal.id}`, dealId: deal.id, text: "Marked won" })
          return deal
        },
      },
    },
  })
}

beforeAll(() => disableSimulatedLatency())

describe("memory adapter", () => {
  it("searches, filters, sorts and pages a list", async () => {
    const data = adapter()
    const result = await data.list("deals", { search: "harbor", filters: { stage: ["lead"] }, sort: [{ id: "amount", desc: true }], pageSize: 1 })
    expect(result.total).toBe(2)
    expect(result.pageCount).toBe(2)
    expect(result.rows.map((deal) => deal.id)).toEqual(["d3"])
  })

  it("creates, updates and removes records, without touching the seed", async () => {
    const data = adapter()
    const created = await data.create("deals", { name: "Copper trial", amount: 9000, stage: "lead" })
    expect(created.id).toBe("deals_1")
    const updated = await data.update("deals", created.id, { amount: 12000 })
    expect(updated).toMatchObject({ id: "deals_1", amount: 12000, name: "Copper trial" })
    await data.remove("deals", "d1")
    expect((await data.list("deals", {})).total).toBe(3)
    expect(seed.deals).toHaveLength(3)
    expect(seed.deals[0].id).toBe("d1")
  })

  it("returns copies, so a screen cannot change the data by mutating a result", async () => {
    const data = adapter()
    const deal = await data.get("deals", "d2")
    deal.amount = 1
    expect((await data.get("deals", "d2")).amount).toBe(45000)
  })

  it("never hands out an id the seed already uses", async () => {
    const data = createMemoryAdapter<Resources>({ seed: { deals: [{ id: "deals_1", name: "Seeded", amount: 1, stage: "lead" }], notes: [] } })
    const created = await data.create("deals", { name: "New", amount: 2, stage: "lead" })
    expect(created.id).toBe("deals_2")
    expect((await data.get("deals", "deals_1")).name).toBe("Seeded")
  })

  it("rejects an unknown resource with a clear error", async () => {
    const data = adapter() as unknown as { create: (resource: string, input: object) => Promise<unknown> }
    await expect(data.create("dealz", {})).rejects.toThrow('Unknown resource "dealz"')
  })

  it("refuses a create with an id that already exists", async () => {
    await expect(adapter().create("deals", { id: "d1", name: "Dup", amount: 1, stage: "lead" })).rejects.toThrow("already exists")
  })

  it("refuses a duplicate id from a custom newId", async () => {
    const data = createMemoryAdapter<Resources>({ seed, newId: () => "d1" })
    await expect(data.create("deals", { name: "Dup", amount: 1, stage: "lead" })).rejects.toThrow('"d1" already exists')
  })

  it("awaits async actions", async () => {
    const data = createMemoryAdapter<Resources>({ seed, actions: { deals: { slow: async () => ({ ok: true }) } } })
    await expect(data.action("deals", "slow")).resolves.toEqual({ ok: true })
  })

  it("rejects an unknown id with NotFoundError", async () => {
    await expect(adapter().get("deals", "missing")).rejects.toBeInstanceOf(NotFoundError)
  })

  it("runs actions that change several resources", async () => {
    const data = adapter()
    const won = await data.action<Deal>("deals", "win", { id: "d1" })
    expect(won.stage).toBe("won")
    expect((await data.list("notes", {})).rows).toEqual([{ id: "n_d1", dealId: "d1", text: "Marked won" }])
    await expect(data.action("deals", "lose", {})).rejects.toThrow('No action "lose"')
  })
})
