# Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Chronicle needs Node.js 20.19 or newer and nothing else: no environment variables, keys or database.

## What to change first

1. **Name and user.** `config/site.ts` holds the brand, the workspaces in the switcher and the signed-in user.
2. **Navigation.** `config/nav.ts` is one list that drives the sidebar, the top navigation, ⌘K and the `G` shortcuts.
3. **Colours.** The `:root` and `.dark` blocks in `app/globals.css`. See [theming](./theming.md).
4. **Data.** `lib/data.ts`. See [connect your backend](./connect-your-backend.md).
5. **Pages you do not need.** Delete the route folder in `app/(shell)/`, its folder in `features/`, and its line in `config/nav.ts`.

## The landing page

`/landing` is Frontier, a SaaS landing page that shares the dashboard's theme. Delete `app/landing` and `features/landing` if you do not need it.

## Checks

```bash
pnpm lint       # ESLint, including the rule that keeps kit/ self-contained
pnpm typecheck  # TypeScript
pnpm test       # Theme contract and data reconciliation tests
```
