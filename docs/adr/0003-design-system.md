# ADR 0003: Design system on native HTML, tested through Storybook

- **Status:** Accepted (Build Phase 1, 9 Nov 2026)
- **Context:** Every later phase builds screens. We need one source of brand tokens and components that is accessible by default (WCAG 2.1 AA), works well on low-end Android phones, and stays visually consistent without the owner checking every change by hand.

## Decision

1. **One package, `packages/ui`**, consumed as TypeScript source by the storefront (`transpilePackages`), like `packages/shared`.
2. **Tokens live in `src/tokens.ts`** (colours with names and uses, fonts, contrast maths) and are mirrored in `src/styles/theme.css` as Tailwind 4 `@theme` variables. A unit test fails if the two drift, and every colour pairing the components use is contrast-tested (text ≥ 4.5:1, outlines and focus rings ≥ 3:1).
3. **Native HTML instead of a component library** (no Radix/React Aria/MUI):
   - `<dialog showModal()>` for the bottom sheet and modal
   - `<details>` for the accordion
   - `<select>` for pickers (best on mobile)
   - real checkboxes and radios

   The browser provides keyboard support, focus trapping and screen-reader semantics. Only Tabs and Toast are hand-built to the WAI-ARIA patterns. This means fewer dependencies and less client-side JavaScript.

4. **The logo is generated, not drawn by hand:** `scripts/build-logo.mjs` turns "fitgaadi" in Bricolage Grotesque Bold into SVG outlines and adds the check-tyre mark. It also writes the React path data, the SVG files and the favicon/app-icon PNGs, so every logo file comes from one source.
5. **Storybook 10 is both the catalogue and the test harness.** The Vitest add-on renders every story in Chromium with axe set to `error`, so any accessibility violation fails CI. Interaction tests (play functions) cover keyboard behaviour.
6. **Visual regression uses Playwright screenshots** of every story and of the prototype pages at 360/390/768/1024/1440 px. Baselines are created and compared only inside the `mcr.microsoft.com/playwright` Docker image (`scripts/visual-baselines.sh`, CI job "visual"), so local and CI pixels match.
7. **Fonts in Storybook are self-hosted** (`@fontsource`) so screenshots never depend on the network. The storefront uses `next/font`, which also self-hosts.

## Consequences

- New UI work starts in `packages/ui`: build the component, add its stories (they become tests automatically), then use it in the storefront.
- Intended visual changes need new baselines (`bash scripts/visual-baselines.sh`, Docker required) committed in the same PR.
- We own the behaviour of Sheet, Tabs and Toast. Their keyboard and focus behaviour is covered by unit tests (jsdom) and Storybook interaction tests (real Chromium).
- Demo data for Storybook and `/prototype` lives in `packages/ui/src/fixtures`. It uses made-up brands and prices, and Phase 2 replaces it with Medusa data in the storefront.
