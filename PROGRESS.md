# Chronicle v3 progress

Plan: shadcnstore-website `product-plan/templates/chronicle/PLAN.md` (issue shadcnstore/shadcnstore-website#72). Branch `v3-kit`; never push `main`, never tag.
Resume from the first unchecked line. Dev server: `PORT=3300 pnpm dev`, open http://localhost:3300 (not 127.0.0.1).

## Done
- [x] Phase A: three prototypes scored, P3 "Workbench" won (plan §11). Files in the website repo `product-plan/templates/chronicle/prototypes/`.
- [x] Root Next.js 16.4.3 app, shadcn base-nova RTL, ui components, Kit v1.0.5 free edition (`kit.lock.json` excludes), local `--exclude` patch in `scripts/kit-sync.mjs`.
- [x] Theme: slate + cobalt in `app/globals.css`, `config/theme.ts`, contract test green for every preset.
- [x] Tidewell generator `data/` with reconciliation tests; `lib/data.ts` memory adapter (users, accounts, tasks).
- [x] Shell wrapper, notifications store, demo funnel chrome (bar, ⌘K group, config).

## Next
- [ ] Overview `/` (P3 home: MRR XL, billing mix, KPIs, needs attention, punch card, hourly signups)
- [ ] Users workbench `/users`, `/users/[id]`
- [ ] Analytics, Tasks, Mail, Chat, Calendar, Notifications, Settings, Auth, Errors, Landing (Frontier port)
- [ ] Demo-only: `/go-further`, settings previews
- [ ] Gates per screen; code-review high once per milestone, one medium pass
- [ ] README, docs/, CHANGELOG 3.0.0, LICENSE note, deploy-demo workflow, LAUNCH.md
- [ ] Images (Codex gpt-6.1-sol), IMAGE-PROMPTS.md
- [ ] Website: nginx 301s, migration (sales_page v3, demo_url), keyword map, seeder, /templates JSON-LD

## Kit findings (for upstream)
1. `customizer-provider` imports `shader/colour`; colour parsing belongs in `theme/`.
2. `auth-forms` imports `auth-layout` (AuthHeading, useAuthCopy), which imports the shader showcase.
3. `kit.json` pins `next`/`react` exactly; patched Next versions warn.
4. `--exclude` for kit-sync (patched locally) and a multi-link DemoBar (Chronicle has its own): logged upstream for a later release.
