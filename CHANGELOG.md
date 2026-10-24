# Changelog

## 3.0.0 (unreleased)

Chronicle is rebuilt on the ShadcnStore Dashboard Kit, the base of ShadcnStore's paid dashboard templates, and becomes one Next.js app at the root of the repository.

### Highlights

- **A new look:** cool slate and cobalt in light and dark, Hanken Grotesk with JetBrains Mono numbers, soft cards on a tinted page. Eight more presets restyle every surface.
- **Real data that adds up:** one fictional company, Tidewell, generated from a seed and pinned to 20 October 2026. Tests prove MRR, plans, seats and sign-ups reconcile.
- **One data adapter for every screen** (`lib/data.ts`): swap the in-memory adapter for your API and the screens keep working.
- **Users workbench:** saved views, faceted filters and search in the address bar, inline role editing, bulk actions with undo, CSV export, a record sheet and a detail page.
- **Overview rebuilt** around MRR, retention, sign-ups, accounts that need attention (with working actions) and product usage.
- **Kit shell:** sidebar or top navigation, inset or floating sidebar, RTL, ⌘K search and actions, `G` shortcuts, notifications, customizer.
- **Tasks** as a board with drag and drop and as a table, on the same adapter.

### Changed

- The app now lives at the repository root. `nextjs-version/` and `vite-version/` are gone from 3.0; both remain in [v2.0.0](https://github.com/shadcnstore/shadcn-dashboard-landing-template/tree/v2.0.0).
- **Next.js only.** The Vite version stays on 2.x, because the Kit uses the Next.js router.
- Sign-in pages are one calm set (sign-in, sign-up, forgot password) instead of three variants each.
- The documentation is plain Markdown in `docs/`.
- Routes: `/dashboard` is now `/`, `/dashboard-2` is `/analytics`, `/auth/sign-in` is `/sign-in`, `/settings/user` is `/settings/profile`.
- Next.js 16.4.3.

### Removed

- The Vite version, the second and third sign-in, sign-up and forgot-password variants, the pricing and FAQ pages inside the app, and the VitePress docs site. The landing page keeps its pricing and FAQ sections.

## 2.0.0 : 2026-10-08

The template moves from Radix UI to [Base UI](https://base-ui.com) and every dependency is on its latest release. Both the Vite and the Next.js versions get the same changes.

### Changed

- **Base UI instead of Radix UI.** Every component in `components/ui` is regenerated from the shadcn/ui registry in the `base-nova` style. No `@radix-ui/*` packages are left, and `vaul` is gone too (the Drawer is Base UI's own).
- **Latest dependencies:** Next.js 16.4, React 19.3, Vite 8, TanStack Table 9, React Router 7.18, react-day-picker 10, react-resizable-panels 4, lucide-react 1.x, Recharts 3.10, Tailwind CSS 4.3, ESLint 10. TypeScript is pinned to 6.0, the newest version typescript-eslint supports.
- **Node.js 20.19+** is now required (Vite 8 and Next.js 16 both need it). The deploy workflow runs on Node 24 with pnpm 10.
- **Next.js:** `middleware.ts` is now `proxy.ts`, and `pnpm lint` runs the ESLint CLI (`next lint` was removed in Next.js 16).
- **Follows the current shadcn/ui conventions:** forms use the `Field` components (`Controller` + `Field` + `FieldError`) instead of the old `Form` wrappers; spacing uses `gap`, never `space-*`; menu and select items live in their groups; icon inputs use `InputGroup`; status colours come from new `success` / `warning` / `info` theme tokens instead of raw palette classes; class merging uses shadcn's `cn` package.
- **Vite routing uses React Router's data router** with lazy routes (`createBrowserRouter`), so every page is still code-split but loads before the navigation commits.

### Fixed

- **Vite: a loading indicator shows on route changes.** The per-route Suspense spinner never appeared on navigation (React Router runs navigations in a transition, which keeps the old page on screen). A progress bar now shows while a page loads, and the first visit shows a full-page spinner. ([#3](https://github.com/shadcnstore/shadcn-dashboard-landing-template/issues/3))
- Toasts now appear: no toaster was mounted, so the dashboard's inline-edit "Saving…" toasts never showed.
- Keyboard access: the theme customizer's radius, mode and sidebar options were clickable `div`s; they are now toggle groups and radio cards.
- The selected theme on Settings → Appearance is highlighted again.
- Clone instructions `cd` into the right directory (thanks [@henryosei](https://github.com/henryosei), [#1](https://github.com/shadcnstore/shadcn-dashboard-landing-template/pull/1)), and the Next.js `components.json` points at the right CSS file (thanks [@youngjunning](https://github.com/youngjunning), [#2](https://github.com/shadcnstore/shadcn-dashboard-landing-template/pull/2)).
- Both versions build again. The Vite build failed on Recharts 3 typings in `chart.tsx`, and both failed on the tasks toolbar.
- The `/login` and `/register` redirects pointed at routes that don't exist.
- Dialogs now get the width their code asks for. Radix's `sm:max-w-lg` default silently overrode unprefixed `max-w-*` classes, which made the event form overflow.
- The dashboard's tab tables were recreated, and their state remounted, on every render.

### Migrating a customized 1.x copy

If you changed the template's own code, these are the API differences you'll meet:

| Radix (1.x) | Base UI (2.0) |
| --- | --- |
| `<Trigger asChild><Button /></Trigger>` | `<Trigger render={<Button />}>…</Trigger>` |
| `<Button asChild><a href="…" /></Button>` | `<Button render={<a href="…" />} nativeButton={false}>…</Button>` |
| `<Accordion type="single" collapsible defaultValue="a">` | `<Accordion defaultValue={["a"]}>` (`multiple` for several open items) |
| `<ToggleGroup type="single" value={v}>` | `<ToggleGroup value={[v]} onValueChange={(next) => …next[0]}>` |
| `<Checkbox checked="indeterminate">` | `<Checkbox indeterminate>` |
| `<Select>` showing the item label | Pass `items` (`{ value: label }` or `[{ label, value }]`) to the root, or the trigger shows the raw value. `onValueChange` can receive `null`. |
| `<SelectContent position="popper">` | Remove it; use `alignItemWithTrigger={false}` if needed |
| `DropdownMenuLabel` anywhere | Wrap it in `DropdownMenuGroup` (Base UI throws otherwise) |
| `<TooltipProvider delayDuration={0}>` | `<TooltipProvider delay={0}>`; per-tooltip delays go on `TooltipTrigger` |
| `<HoverCard openDelay closeDelay>` | `delay` / `closeDelay` on `HoverCardTrigger` |
| `<SheetContent onInteractOutside>` | `onOpenChange={(open, details) => details.reason === "outside-press" && details.cancel()}` on `Sheet` |
| `data-[state=open]:` | `data-open:` (popups), `data-popup-open:` (menu triggers), `data-panel-open:` (accordion triggers) |
| `data-[state=active]:` / `data-[state=on]:` | `data-active:` (tabs) / `data-pressed:` (toggles) |
| `<Drawer direction="right">` | `<Drawer swipeDirection="right">` (`"down"` for a bottom sheet) |

Other library changes:

- **TanStack Table 9:** the tables share one feature set in `lib/data-table.ts` and use `useTable({ features, … })`. Column types take the features first: `ColumnDef<DataTableFeatures, Task>`.
- **react-resizable-panels 4:** `direction` is now `orientation`, and bare numbers are **pixels**, so use `"20%"` for percentages.
- **lucide-react 1.x** dropped brand icons. GitHub, Twitter, LinkedIn and the rest now live in `components/icons/brand-icons.tsx`.

## 1.0.0

Initial release.
