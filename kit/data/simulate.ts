/**
 * Demo switches for showing every loading and error state without a backend:
 *
 *   ?latency=1500        every request takes 1.5 s, so skeletons are visible
 *   ?latency=on          every request takes a realistic 120 to 300 ms
 *   ?latency=0           no delay, even if the template opted in (also `off`)
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
  /** From `?latency`: ms per request, "jitter" for 120 to 300 ms, 0 for none; null when the address does not say. */
  latency: Latency | null
  fail: Set<string>
  empty: Set<string>
}

const MAX_LATENCY = 10000

let switches: Switches | null = null
/** Set by `enableSimulatedLatency()`; `?latency` in the address wins over it, including `?latency=0`. */
let enabled: Latency = 0
let instant = false

/**
 * Opt in to a delay on every request without `?latency` in the address.
 * No argument gives a realistic 120 to 300 ms; a number gives that many ms.
 */
export function enableSimulatedLatency(ms?: number): void {
  enabled = ms === undefined ? "jitter" : Math.max(0, Math.min(ms, MAX_LATENCY))
}

/** Tests and scripts: no delay at all, even when the address or `enableSimulatedLatency()` asks for one. */
export function disableSimulatedLatency(): void {
  instant = true
}

const OFF_WORDS = new Set(["0", "off", "false", "no"])

function parseLatency(raw: string | null): Latency | null {
  if (raw === null) {
    return null
  }
  const value = raw.trim().toLowerCase()
  // `?latency=1500` is a fixed delay; `0`, `off`, `false` or a negative number is none; anything else
  // (`?latency`, `?latency=on`, a typo such as `500ms`) is the 120 to 300 ms jitter.
  const ms = Number(value)
  if (OFF_WORDS.has(value) || ms < 0) {
    return 0
  }
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
  const latency = read().latency ?? enabled
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
