/**
 * Demo switches for showing every loading and error state without a backend:
 *
 *   ?latency=1500        every request takes 1.5 s, so skeletons are visible
 *   ?latency=on          every request takes a realistic 120 to 300 ms
 *   ?fail=orders         requests for the `orders` resource fail
 *   ?fail=all            every request fails
 *   ?empty=customers     lists for `customers` come back empty
 *
 * Requests are instant unless the address asks for latency or the template
 * calls `enableSimulatedLatency()`: a delay on every query costs first paint
 * and the Lighthouse score. Read once per page load. A real adapter never
 * calls these.
 */

type Latency = number | "jitter"

interface Switches {
  /** Milliseconds per request, or "jitter" for 120 to 300 ms; 0 is instant. */
  latency: Latency
  fail: Set<string>
  empty: Set<string>
}

const MAX_LATENCY = 10000

let switches: Switches | null = null
/** Set by `enableSimulatedLatency()`; a delay named in the address wins over it. */
let enabled: Latency = 0
let instant = false

/**
 * Opt in to a delay on every request without `?latency` in the address.
 * No argument gives a realistic 120 to 300 ms; a number gives that many ms.
 */
export function enableSimulatedLatency(ms?: number): void {
  enabled = ms === undefined ? "jitter" : Math.max(0, Math.min(ms, MAX_LATENCY))
  instant = false
}

/** Tests and scripts: no delay at all, even when the address asks for one. */
export function disableSimulatedLatency(): void {
  instant = true
}

function parseLatency(raw: string | null): Latency {
  if (raw === null || raw.trim() === "0") {
    return 0
  }
  const ms = Number(raw)
  // `?latency=1500` is a fixed delay; `?latency` with no number (`?latency`, `?latency=on`) is the jitter.
  return ms > 0 ? Math.min(ms, MAX_LATENCY) : "jitter"
}

function read(): Switches {
  if (switches) {
    return switches
  }
  const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search)
  const list = (name: string) =>
    new Set(
      (params.get(name) ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  switches = {
    latency: parseLatency(params.get("latency")),
    fail: list("fail"),
    empty: list("empty"),
  }
  return switches
}

export class SimulatedError extends Error {
  constructor(resource: string) {
    super(`The demo was asked to fail requests for "${resource}" (remove ?fail from the address).`)
    this.name = "SimulatedError"
  }
}

/** The delay for one request in ms: 0 unless the address or `enableSimulatedLatency()` asked for one. */
export function simulatedDelay(): number {
  if (instant) {
    return 0
  }
  const fromAddress = read().latency
  const latency = fromAddress !== 0 ? fromAddress : enabled
  // The jitter only times a request; it never feeds a displayed value.
  return latency === "jitter" ? 120 + Math.random() * 180 : latency
}

/** Wait the requested latency, if any, then fail if asked to. */
export async function simulate(resource: string): Promise<void> {
  const { fail } = read()
  const wait = simulatedDelay()
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait))
  }
  if (fail.has("all") || fail.has(resource)) {
    throw new SimulatedError(resource)
  }
}

export function shouldBeEmpty(resource: string): boolean {
  const { empty } = read()
  return empty.has("all") || empty.has(resource)
}

/** Tests only: forget the address and every switch. */
export function resetSimulatedSwitches(): void {
  switches = null
  enabled = 0
  instant = false
}
