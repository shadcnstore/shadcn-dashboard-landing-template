# The Dashboard Kit

`kit/` is a vendored copy of the ShadcnStore Dashboard Kit, the shared base of ShadcnStore's dashboard templates: shell, customizer, ⌘K, shortcuts, notifications, data adapter, data table, saved views, widgets, charts, settings frame, account page and UI patterns. In this repository it is MIT licensed like everything else.

## Can I edit it?

In your own copy of Chronicle, yes: it is your code. In this repository, changes to `kit/` are made upstream and synced in, so `pnpm kit:check` fails when a file in `kit/` differs from the synced version. If you want to contribute a Kit change, open an issue.

## The boundary

`kit/` imports only itself, npm packages, `components/ui/*`, `lib/utils` and `lib/clock`. ESLint enforces it, so the Kit never depends on a screen.

## What the free edition leaves out

The paid templates also ship the Kit's organisation screens (team and roles, API keys, billing and plans), its WebGL shader engine and the animated sign-in built on it. Chronicle has its own sign-in pages instead.
