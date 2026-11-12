# CLAUDE.md

Project context for AI coding sessions. The human-facing docs are `README.md` and `docs/PLAN.md`.

## Working agreement

- Work proceeds in **Build Phases 0–5** (`docs/PLAN.md` §7). Don't start a phase until the owner has signed off the previous one.
- Every phase ships automated tests (unit, integration, e2e incl. axe) **and** a manual test script in `docs/test-plans/`.
- Business model: **drop-shipping from suppliers** (see `docs/adr/0002-drop-shipping.md`).

## Layout

- `apps/storefront`: Next.js 16 (App Router, **Cache Components + Partial Prefetching on**), Tailwind 4. Read `apps/storefront/AGENTS.md` and the docs in `node_modules/next/dist/docs/` before writing Next code. APIs differ from older Next versions.
- `apps/backend`: Medusa 2.22 (from `medusajs/dtc-starter`). Import from `@medusajs/framework/*` subpaths, not `@medusajs/utils`. Each `@medusajs/*` package ships an `AGENTS.md` for the installed version; prefer it over memory.
- `packages/shared`: TS source consumed directly (`transpilePackages` in the storefront).
- `packages/ui`: design system (tokens in `src/tokens.ts` + `src/styles/theme.css`, logo, components, Storybook 10). Build UI from these components; add a story for every new component or state. Demo data for Storybook and `/prototype` lives in `src/fixtures`.

## Commands (pnpm 10, run from the repo root)

`pnpm dev` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm test:integration` · `pnpm build` · `pnpm test:e2e` · `pnpm db:migrate` · `pnpm format`

Design system: `pnpm --filter @autoparts/ui dev` (Storybook :6006) · `… test:storybook` (every story in Chromium, axe = error) · `bash scripts/visual-baselines.sh` (update screenshot baselines in Docker; `--check` to compare like CI). Regenerate logo files with `pnpm --filter @autoparts/ui logo`.

## Gotchas found so far

- Windows PowerShell 5.1 `Set-Content -Encoding utf8` writes a BOM, which breaks `package.json` parsing in Turbopack. Edit files with the editor tools instead.
- Git Bash mangles `$APPDATA` paths for pnpm; run pnpm from PowerShell.
- `medusa start` needs the built `.medusa/server`. Use `medusa develop` for local/CI runs.
- Medusa v2 stores prices in **major units** (rupees, as exact decimals), not paise.
- Contrast: brand colours on their own 10% tint fail AA (e.g. `text-fit` on `bg-fit/10` = 4.39:1). Use solid fills with white text, or check with axe.
- Screenshot baselines are Linux-only and must come from `scripts/visual-baselines.sh` (Playwright Docker image), never from Windows.
- Don't put two utilities for the same property on one element (e.g. a default `h-7` plus a caller's `h-12`): which wins depends on CSS order. Apply defaults only when the caller passes none.
- Cache Components: a route handler that returns early before touching the request gets prerendered. Call `await connection()` first. `new Date()` in a prerendered component fails the build.
- `<dialog>`: React runs all effect cleanups before new effects, so don't rely on a `close` listener registered in another effect to restore focus. Restore it where you call `close()`.
- Dependabot's capitalised commit subjects are ignored by commitlint (see `commitlint.config.mjs`).
- Medusa imports **every file under `apps/backend/src/search/`** at boot. Keep tests and other files out of that folder (a spec there broke CI migrations and every integration suite).
- Medusa search: typo tolerance is opt-in per query (`search_options.typo_tolerance: true`). The test runner doesn't build or seed search indexes, so search is tested in the storefront E2E suite. See ADR 0004.
- Custom query params on core store routes: register the middleware **without `method`**. Method-less middlewares run before the core's strict query validation (see `vehicle-filter.ts`).
- Store product fields: `variants.metadata` and `categories.handle` are silently dropped. Use `*variants` / `*categories`; for link fields use `+brand.name` (not `*brand`).
- Medusa returns 422 for `DUPLICATE_ERROR` and 400 for `NOT_ALLOWED`. `medusa lint` rejects destructured route exports (`export const { GET } = …`).
- Storefront fallbacks for an unreachable backend must use `cacheLife("minutes")`, never `"seconds"`: Next treats that as dynamic and the build fails. Check with `MEDUSA_BACKEND_URL=http://127.0.0.1:9 pnpm build`. A storefront built while the backend is down bakes in the empty fallback; rebuild before running E2E.
- `notFound()` inside a streamed (Suspense) page gives status 200 + noindex, not 404. Test the content, not the status.
- Inputs that users may type into before hydration must be uncontrolled (see `SearchBox`).
