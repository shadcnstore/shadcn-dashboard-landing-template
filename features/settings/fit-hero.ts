/**
 * The Kit's SettingsHero splits into two columns at the md breakpoint. Beside
 * the app sidebar and the settings menu, a 768 or 1024px screen leaves the
 * page under 500px, so the hero squeezed its title to "3 of 3 ch...". Wrap
 * the page in SETTINGS_PAGE and pass FIT_HERO to the hero: it then splits only
 * when the page itself is 768px wide.
 */
export const SETTINGS_PAGE = "@container/settings flex min-w-0 flex-col gap-4"

export const FIT_HERO =
  "md:flex-col @3xl/settings:flex-row [&>div:first-child]:w-auto @3xl/settings:[&>div:first-child]:w-2/5 [&>div:nth-child(2)]:border-s-0 [&>div:nth-child(2)]:border-t @3xl/settings:[&>div:nth-child(2)]:border-s @3xl/settings:[&>div:nth-child(2)]:border-t-0"
