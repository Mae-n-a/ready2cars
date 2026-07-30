## Styling conventions (follow these, do not improvise)

**1. Tailwind first.** Layout, spacing, colour, typography, borders, flex/grid, transitions,
hover/focus/active states and motion preferences are all Tailwind utilities. Reach for a
`<style>` block only for the allowlist in rule 6.

**2. Never hardcode a value that a token exists for.** No raw hex, no `rgba(...)`, no
one-off shadows in component markup. Tokens live in `src/styles/global.css` under `@theme`
and are usable as `bg-ink`, `text-accent`, `shadow-card`, `ease-brand`, `font-display`, etc.
If a value is used twice, it becomes a token. If it is used once and is genuinely unique,
an arbitrary value is acceptable — but prefer a token.

**3. Repeated patterns become a component class**, defined once in `@layer components` in
`global.css` (`.btn`, `.shell`, `.section-title`, `.section-lede`, `.skip`). Do not
re-implement a button or a container inline.

**4. Motion is variant-driven, not media-query-driven.**
- `motion-safe:` for anything that moves. Never hand-write a `prefers-reduced-motion` block
  for something a variant can express.
- `hover:` in Tailwind v4 already compiles to `@media (hover: hover)`, so do NOT wrap hover
  rules in your own hover media query.
- Every interactive element needs all three: `hover:`, `focus-visible:` and `active:`.
- Standard durations: `duration-200` (micro-feedback), `duration-300` (hover/state),
  `duration-500`+ (entrances). Standard easing: `ease-brand`.

**5. Motion intensity budget** (from the ui-ux-pro-max motion guidance):
- Subtle feedback: displacement ≤ 2px, 150–200ms.
- Standard hover: `y-1`/`scale-[1.02]`-ish, 200–300ms.
- Never animate layout properties (width/height/margin/top) on hover — transform and
  opacity only, so it stays on the compositor.
- At most 1–2 "magnetic"/showy elements per screen.

**6. `<style>` blocks are allowed ONLY for what Tailwind genuinely cannot express:**
`@keyframes`, `image-set()` backgrounds, `::backdrop`, `display: contents`, native
`<dialog>` positioning, and styling slotted content that arrives through `<slot>` (the
legal pages). Anything else in a `<style>` block is a bug in the code, not a style choice.
Each such block must carry a one-line comment saying which of these reasons applies.

**7. Component file order:** frontmatter (`---`) → markup → `<script>` → `<style>`.

**8. Business data always comes from `src/data/site.ts`.** Never inline a phone number,
email, VAT number or social URL.

**9. Accessibility is not optional:** one `h1` per page, real landmarks, `alt` + `width` +
`height` on every image, labels tied to inputs, and visible focus states. `npx playwright
test` must stay green — it includes axe scans of all three pages.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
