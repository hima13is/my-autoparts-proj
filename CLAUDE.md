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

## Commands (pnpm 10, run from the repo root)

`pnpm dev` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm test:integration` · `pnpm build` · `pnpm test:e2e` · `pnpm db:migrate` · `pnpm format`

## Gotchas found so far

- Windows PowerShell 5.1 `Set-Content -Encoding utf8` writes a BOM, which breaks `package.json` parsing in Turbopack. Edit files with the editor tools instead.
- Git Bash mangles `$APPDATA` paths for pnpm; run pnpm from PowerShell.
- `medusa start` needs the built `.medusa/server`. Use `medusa develop` for local/CI runs.
- Medusa v2 stores prices in **major units** (rupees, as exact decimals), not paise.
- Contrast: brand colours on their own 10% tint fail AA (e.g. `text-fit` on `bg-fit/10` = 4.39:1). Use solid fills with white text, or check with axe.
