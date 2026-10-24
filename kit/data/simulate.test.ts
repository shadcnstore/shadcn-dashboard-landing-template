import { afterEach, describe, expect, it, vi } from "vitest"

import { disableSimulatedLatency, enableSimulatedLatency, resetSimulatedSwitches, simulatedDelay } from "./simulate"

function address(search: string) {
  vi.stubGlobal("window", { location: { search } })
}

afterEach(() => {
  vi.unstubAllGlobals()
  resetSimulatedSwitches()
})

describe("simulated latency", () => {
  it("is off by default, on the server and in the browser", () => {
    expect(simulatedDelay()).toBe(0)
    resetSimulatedSwitches()
    address("?fail=orders")
    expect(simulatedDelay()).toBe(0)
  })

  it("takes a fixed delay or the jitter from the address", () => {
    address("?latency=1500")
    expect(simulatedDelay()).toBe(1500)
    resetSimulatedSwitches()
    address("?latency=on")
    const jitter = simulatedDelay()
    expect(jitter).toBeGreaterThanOrEqual(120)
    expect(jitter).toBeLessThanOrEqual(300)
    resetSimulatedSwitches()
    address("?latency=0")
    expect(simulatedDelay()).toBe(0)
  })

  it("is opted into by a call, and the address still wins", () => {
    enableSimulatedLatency(400)
    expect(simulatedDelay()).toBe(400)
    resetSimulatedSwitches()
    enableSimulatedLatency()
    expect(simulatedDelay()).toBeGreaterThanOrEqual(120)
    resetSimulatedSwitches()
    address("?latency=900")
    enableSimulatedLatency(400)
    expect(simulatedDelay()).toBe(900)
  })

  it("is switched off entirely by disableSimulatedLatency", () => {
    address("?latency=1500")
    disableSimulatedLatency()
    expect(simulatedDelay()).toBe(0)
  })
})
