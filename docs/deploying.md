# Deploying

## As a Next.js app

```bash
pnpm build
pnpm start
```

Any Node.js host or platform that runs Next.js works.

## As a static site

```bash
STATIC_EXPORT=1 pnpm build                    # served from the domain root
STATIC_EXPORT=1 BASE_PATH=/admin pnpm build   # served under /admin
```

writes a static export to `out/`. A static export cannot run server code, so detail routes use one placeholder page (see [adding a page](./adding-a-page.md)) and your host must serve `<route>/_.html` for ids it has no file for, as `scripts/serve-demo.mjs` does locally.

## The public demo

`pnpm build:demo` is the build behind demo.shadcnstore.com/chronicle: a static export under `/chronicle` plus the demo extras in `features/demo` (the bar at the bottom, the "Go further" page and previews of paid-template screens). None of that is in the other two builds. Delete `features/demo`, the `*.demo.tsx` pages and the demo lines in `app/layout.tsx` and `config/nav.ts` if you want them gone from the code too.
