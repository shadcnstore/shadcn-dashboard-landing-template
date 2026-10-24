# Theming

Chronicle's look is a set of CSS variables in `app/globals.css`: cool slate neutrals and one cobalt accent, in a `:root` (light) block and a `.dark` block. Every surface reads from them: page, cards, sidebar, borders and the chart colours.

## Change the colours

Edit the two blocks. Keep each pair readable: `config/theme.test.ts` checks every text and background pair against WCAG AA in both modes (`pnpm test`), for the default theme and every preset.

Chart rules: the lead series is `--chart-lead` (the primary colour by default), then `--chart-2` and `--chart-3`. The faint ends of the ramp (`--chart-4`, `--chart-5`) are for backgrounds only.

## Presets and the customizer

The palette button in the header opens the customizer: preset, radius, font, scale, content width, sidebar style, layout (sidebar or top navigation) and direction (LTR or RTL). Choices are saved in the browser and applied before the first paint, so there is no flash.

`config/theme.ts` lists what the customizer offers: Chronicle's own theme first, then eight presets adapted from [tweakcn](https://tweakcn.com) (Apache-2.0). Set `defaults` there to change what a first-time visitor sees, or remove presets you do not want.

## Fonts

UI text is Hanken Grotesk and numbers are JetBrains Mono, both loaded with `next/font` in `app/layout.tsx`. To add a font, load it there with a CSS variable and add it to `fonts` in `config/theme.ts`.

## Dark mode

`next-themes` toggles the `dark` class. Press `D` anywhere, or use the sun and moon button.
