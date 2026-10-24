# Adding a page

1. Create the route: `app/(shell)/invoices/page.tsx`. Anything inside `(shell)` gets the sidebar, header and breadcrumbs.
2. Put the screen in `features/invoices/invoices-page.tsx` and render it from the route.
3. Add it to `config/nav.ts`:

```ts
{ title: "Invoices", href: "/invoices", icon: ReceiptIcon, shortcut: "i" }
```

It now appears in the sidebar, the top navigation, ⌘K, and `G` then `I` jumps to it.

4. Start the page with `PageHeader` (`kit/ui-patterns/page-header`) so it matches the others, and build widgets from `kit/widgets/widget.tsx` and `kit/charts/*`.

For a list, copy `features/users/users-page.tsx`: it shows URL state (`useListState`), saved views (`ViewTabs`), filters (`FacetedFilter`), the data table, pagination and bulk actions.

## Detail pages in a static export

A static export cannot pre-render one page per record. `app/(shell)/users/[id]/page.tsx` exports a single placeholder (`generateStaticParams` returns `[{ id: "_" }]`) and the page reads the real id with `useRouteId()`. A normal `next build` needs none of this.
