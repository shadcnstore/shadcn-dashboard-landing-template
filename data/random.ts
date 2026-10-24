/**
 * A small seeded random source. The same seed always produces the same workspace,
 * so screenshots, tests and the live demo agree with each other.
 */
export class Random {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0
  }

  /** Mulberry32: a float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0
    let t = this.state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** An integer in [min, max], both inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1))
  }

  chance(probability: number): boolean {
    return this.next() < probability
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)]
  }

  weighted<T>(items: readonly T[], weight: (item: T) => number): T {
    const total = items.reduce((sum, item) => sum + weight(item), 0)
    let roll = this.next() * total
    for (const item of items) {
      roll -= weight(item)
      if (roll < 0) {
        return item
      }
    }
    return items[items.length - 1]
  }

  /** Pick an index from a list of probabilities that sum to 1. */
  distribution(probabilities: readonly number[]): number {
    let roll = this.next()
    for (let index = 0; index < probabilities.length; index++) {
      roll -= probabilities[index]
      if (roll < 0) {
        return index
      }
    }
    return probabilities.length - 1
  }

  digits(length: number): string {
    let out = ""
    for (let index = 0; index < length; index++) {
      out += this.int(0, 9).toString()
    }
    return out
  }
}
