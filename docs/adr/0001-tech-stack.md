# ADR 0001: Tech stack and repository layout

- **Status:** Accepted (owner approved the plan on 5 Nov 2026 and chose Medusa)
- **Context:** Small team, India market, mobile-first, needs cart/checkout/admin quickly at low cost.

## Decision

| Layer                    | Choice                                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Storefront               | Next.js 16 (App Router, Cache Components) + Tailwind CSS 4                                                           |
| Commerce backend + admin | Medusa 2.22, based on `medusajs/dtc-starter` (`apps/backend` only; we write our own storefront for a unique brand)   |
| Database / cache         | PostgreSQL / Redis                                                                                                   |
| Search                   | Meilisearch (Phase 2; Medusa 2.22's built-in search-index framework will be evaluated as the integration point)      |
| Monorepo                 | pnpm 10 workspaces + Turborepo                                                                                       |
| Tests                    | Vitest (shared, storefront) · Jest + `@medusajs/test-utils` (backend) · Playwright + axe-core (e2e)                  |
| CI                       | GitHub Actions: quality, integration (Postgres service), e2e (Postgres + Redis + live backend), gitleaks, commitlint |

## Notes

- `medusa-starter-default` is deprecated upstream; `dtc-starter` is its replacement.
- Node ≥ 22.23.4 is required by Medusa 2.22.
- Medusa stores money in major units as exact decimals, so the plan's "integers in paise" rule is replaced by "never use floating-point maths on money; use Medusa's BigNumber values."

## Consequences

- Medusa gives us cart, orders, promotions, inventory, fulfilment and admin for free. We build Vehicle/Fitment, Supplier, GST invoice and Razorpay/Shiprocket integrations as custom modules.
- Upgrades: Dependabot groups `@medusajs/*` so they move together.
