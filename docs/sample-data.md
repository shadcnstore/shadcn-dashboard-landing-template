# Sample data

The demo company is **Chronicle**, a fictional subscription-analytics business with customer accounts on three plans (Starter, Growth, Scale). `data/generate.ts` builds two years of it from one seed: accounts, users, tasks, monthly MRR movements and an activity feed.

## Why the numbers never change

`lib/clock.ts` pins "now" to 20 October 2026, noon UTC, and the generator uses a seeded random source. The same seed and the same "now" give the same workspace on every visit, so charts and screenshots are stable. Charts with a shape that matters (sign-ups by hour, product usage) use hand-written series in `features/overview/fixed.ts`.

## Proof that it adds up

`data/generate.test.ts` checks, among others, that:

- the last month of MRR equals the sum of every paying account's MRR,
- each month's MRR equals the previous month plus new and expansion, minus contraction and churn,
- MRR by plan adds up to the total,
- an account's seats equal its active users,
- every email is on `example.com`.

`features/overview/metrics.test.ts` does the same for the Overview's figures.

## Using real time

Set `DEMO_NOW` to `null` in `lib/clock.ts` and the clock is the real one.
