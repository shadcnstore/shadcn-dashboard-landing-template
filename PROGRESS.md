# Chronicle v3 progress

Plan: shadcnstore-website `product-plan/templates/chronicle/PLAN.md` (issue shadcnstore/shadcnstore-website#72). Launch steps: the same folder's `LAUNCH.md`.
Branch `v3-kit`; never push `main`, never tag. Resume from the first unchecked line.
Dev server: `PORT=3300 pnpm dev`, http://localhost:3300 (not 127.0.0.1). Demo build: `pnpm build:demo && PORT=4180 node scripts/serve-demo.mjs`, http://localhost:4180/chronicle/.

## Done
- [x] Phase A: three prototypes scored, P3 "Workbench" won (plan §11).
- [x] Foundations: root Next.js 16.4.3 app, shadcn base-nova RTL, Kit v1.0.6 free edition (kit.lock.json excludes; local `--exclude` patch in scripts/kit-sync.mjs), slate and cobalt theme passing the contract for every preset, Tidewell generator with reconciliation tests, DataAdapter (users, accounts, tasks).
- [x] Screens: Overview, Analytics, Users (+ detail, sheet, invite), Tasks (board + table), Mail, Chat, Calendar, Notifications, Settings (profile, account, appearance, notifications), sign-in, sign-up, forgot password, 5 error pages, not-found, /landing (Frontier).
- [x] Demo funnel (demo build only): bar, ⌘K group, Go further page, paid-screen previews (team, billing, API keys), GA4 `demo_bar_click` with placements.
- [x] Docs, README, CHANGELOG 3.0.0, LICENSE, workflows (deploy-demo manual, ci on PRs).
- [x] Images: Codex backdrop + auth panel; v3 captures; photo cards (real captures on a Codex scene). In silicondeck-assets (committed, not built or uploaded).
- [x] Gates: lint, typecheck, 73 tests, kit:check, build, demo build; axe clean on 22 routes x 375/1440 x light/dark except the empty reply textarea's placeholder; no console errors; no horizontal overflow.
- [x] Lighthouse mobile (demo build, gzip): /landing 91, / 78 to 82, /users 83. Below 90 on dashboard routes: see plan §11.
- [x] Website (local commits): nginx 301s, v3 sales page migration, keyword map, seeder, JSON-LD.

## Next
- [x] Code review (high): 8 of 10 fixed (7fac96a), 2 kept with reasons in the plan; medium confirming pass
- [ ] Final screenshots review; plan and issue sync

## Kit findings (for upstream)
1. `customizer-provider` imports `shader/colour`; colour parsing belongs in `theme/`.
2. `auth-forms` imports `auth-layout` (AuthHeading, useAuthCopy), which imports the shader showcase.
3. `kit.json` pins `next`/`react` exactly; patched Next versions warn.
4. `--exclude` for kit-sync (patched locally) and a multi-link DemoBar (Chronicle has its own).
5. DataTable: no screen-reader-only header for an icon column; mobile rows need `role="listitem"` from the consumer.
6. NotificationsInbox: `text-muted-foreground/80` labels and fixed `lg:grid-cols-5`.
7. Adapter: no "all rows" query, no optimistic updates in useKitMutation, `useList` needs explicit generics.
8. Shell JS weight: ⌘K (cmdk), customizer panel and notification bell load on first paint on every route; lazy-loading them is the main lever for Lighthouse 90 on dashboard routes.
