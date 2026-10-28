# Chronicle v3 progress

Plan: shadcnstore-website `product-plan/templates/chronicle/PLAN.md` (issue shadcnstore/shadcnstore-website#72). Launch steps: the same folder's `LAUNCH.md`.
Branch `v3-kit`; never push `main`, never tag. Resume from the first unchecked line.
Dev server: `PORT=3300 pnpm dev`, http://localhost:3300 (not 127.0.0.1). Demo build: `pnpm build:demo && PORT=4180 node scripts/serve-demo.mjs`, http://localhost:4180/chronicle/.

## Done
- [x] Phase A: three prototypes scored, P3 "Workbench" won (plan §11).
- [x] Foundations: root Next.js 16.4.3 app, shadcn base-nova RTL, Kit v1.0.6 free edition (kit.lock.json excludes; local `--exclude` patch in scripts/kit-sync.mjs), slate and cobalt theme passing the contract for every preset, Chronicle generator with reconciliation tests, DataAdapter (users, accounts, tasks).
- [x] Screens: Overview, Analytics, Users (+ detail, sheet, invite), Tasks (board + table), Mail, Chat, Calendar, Notifications, Settings (profile, account, appearance, notifications), sign-in, sign-up, forgot password, 5 error pages, not-found, /landing (Frontier).
- [x] Demo funnel (demo build only): bar, ⌘K group, Go further page, paid-screen previews (team, billing, API keys), GA4 `demo_bar_click` with placements.
- [x] Docs, README, CHANGELOG 3.0.0, LICENSE, workflows (deploy-demo manual, ci on PRs).
- [x] Images: Codex backdrop + auth panel; v3 captures; photo cards (real captures on a Codex scene). In silicondeck-assets (committed, not built or uploaded).
- [x] Gates: lint, typecheck, 73 tests, kit:check, build, demo build; axe clean on 22 routes x 375/1440 x light/dark except the empty reply textarea's placeholder; no console errors; no horizontal overflow.
- [x] Lighthouse mobile (demo build, gzip): /landing 91, / 78 to 82, /users 83. Below 90 on dashboard routes: see plan §11.
- [x] Website (local commits): nginx 301s, v3 sales page migration, keyword map, seeder, JSON-LD.

## Next
- [x] Code review (high): 8 of 10 fixed (7fac96a), 2 kept with reasons in the plan; medium confirming pass: 9 findings, fixed in 14a3e7d (cap reached, no further rounds)
- [x] Branch pushed; plan and issue synced. Remaining: owner decisions and LAUNCH.md

## Owner review round 1 (2026-10-24): done
- [x] Heatmap rebuilt (components/chronicle/heatmap.tsx), Overview small cards 2x2/1x4 with axes, 7-day users card reconciles, Seats card, MRR movement outer-end rounding and thin-segment merge
- [x] 32 Codex portraits in public/avatars, lib/avatars.ts (named people hand-mapped, others hashed in pools)
- [x] Go further: direction A Showcase built (25 vs 22), one config in features/demo/config.ts
- [x] Sweep of every route at 375/768/1024/1440 light and dark; Kit v1.0.8
- [x] Code review high (10, 9 fixed) and one medium pass (10, fixed); cap reached
- Lighthouse mobile (demo build, gzip, Kit 1.0.8): / 82-83, /landing 91, /users 82-83, /go-further 87; a11y 100 on all four

## Owner review round 3 (2026-10-27)
- [x] Needs attention rows show the account owner's portrait and name (an active admin when that face is already on a row above); customers never use a reserved portrait (customerAvatarFor, lib/avatars.test.ts)
- [x] Settings > Account and security shows the signed-in user's portrait (Kit finding 10)

## Owner review round 4 (2026-10-27)
- [x] v2 breadth back: sign-in, sign-up and forgot password in three layouts each (split, card, full-bleed; features/auth/auth-shell.tsx), Pricing and FAQs as Chronicle example pages, Settings > Connections (free; neither Emporium nor Rapport has one). Sidebar "Pages" group with folding Auth pages and Errors.
- [x] Demo bar: "Paid templates" opens a card on hover, tap or Enter (features/demo/upgrade-card.tsx), placements bar-card-open, bar-card-emporium, bar-card-pro
- [x] Profile hero keyed to the page width (FIT_HERO), so the preview is no longer clipped at 1024
- Lighthouse mobile (demo build): / 78-83, /landing 90-91, a11y 100

## Owner review round 5 (2026-10-28)
- [x] Landing pricing and FAQ read the in-app plans and help centre (features/pricing/plans.ts, features/faqs/data.ts); launch copy says a Vite edition is planned
- [x] /landing rebuilt on v2's layout in Chronicle's theme: real 2x screenshots, journal covers built from real widget cards over token backdrops, Kit customizer in the header (shares state with the dashboard), demo bar steps aside over the hero shot
- [x] Sample company renamed Tidewell to Chronicle; config/brand.ts holds name, mark, tagline and removable ShadcnStore credits (landing footer, sidebar, auth); new mark and favicon
- Lighthouse mobile /landing 89 to 91 (simulated LCP is the tight spot)

- [x] Kit v1.1.1 synced: 2px gap between sidebar items; Auth pages and Errors use `expandOnly`

## Kit findings (for upstream)
1. `customizer-provider` imports `shader/colour`; colour parsing belongs in `theme/`.
2. `auth-forms` imports `auth-layout` (AuthHeading, useAuthCopy), which imports the shader showcase.
3. `kit.json` pins `next`/`react` exactly; patched Next versions warn.
4. `--exclude` for kit-sync (patched locally) and a multi-link DemoBar (Chronicle has its own).
5. DataTable: no screen-reader-only header for an icon column; mobile rows need `role="listitem"` from the consumer.
6. NotificationsInbox: `text-muted-foreground/80` labels and fixed `lg:grid-cols-5`.
7. Adapter: no "all rows" query, no optimistic updates in useKitMutation, `useList` needs explicit generics.
8. Shell JS weight: ⌘K (cmdk), customizer panel and notification bell load on first paint on every route; lazy-loading them is the main lever for Lighthouse 90 on dashboard routes.
9. SettingsHero switches to two columns at the viewport `md`, so inside the settings frame (sidebar + settings nav) its two-fifths column is ~180px at 768-1279px; it should use a container query.
10. AccountPage takes a `ShellUser` but ignores `user.avatar`, so the signed-in user shows initials there and a photo everywhere else. Chronicle owns a fixed copy in features/settings/account-page.tsx and excludes `account/**` in kit.lock.json; drop both once the Kit renders the avatar.
11. NavMain: labeled groups cannot fold. (Fixed in v1.1.1: a parent now opens when one of its items is active, and `expandOnly` makes the whole row the toggle.)
