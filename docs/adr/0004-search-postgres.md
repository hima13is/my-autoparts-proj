# ADR 0004: Product search on Medusa's search module with the Postgres provider (not Meilisearch)

- **Status:** Accepted (Build Phase 2, 11 Nov 2026). Replaces the Meilisearch plan in PLAN §4/§5 for launch.
- **Context:** PLAN §7 Phase 2 asks for typo-tolerant search ("seet cvr" finds seat covers; "dashcam", "dash cam" and "dascam" give the same results), an instant dropdown, a results page and a "fits my car" filter. The plan assumed a separate Meilisearch service. Medusa 2.22 now ships a search module whose default provider stores indexes in our own Postgres (`tsvector` full-text search plus `pg_trgm` typo tolerance), and the starter already indexes products with it (`apps/backend/src/search/product.ts`, `POST /store/search`).

## What we tested (local, 121 demo products)

| Query                            | Postgres search as shipped | With our settings                         |
| -------------------------------- | -------------------------- | ----------------------------------------- |
| dashcam / dash cam / dascam      | only "dashcam" worked      | all three ✅                              |
| seet cvr                         | nothing                    | seat covers ✅                            |
| parfume                          | nothing                    | perfumes ✅                               |
| "seat cover" for a Creta 2nd gen | n/a                        | only the Creta cover + universal items ✅ |

"Our settings" are:

- typo tolerance switched on per query (`search_options.typo_tolerance: true`; it is opt-in)
- a `keywords` field per category for words that aren't typos ("cvr", "dash cam", Hinglish)
- a `fit_keys` field (`all`, `g:<generation>`, `v:<variant>`) that mirrors the fitment rules

## Decision

Use the built-in search module with the Postgres provider for launch. No Meilisearch service.

## Consequences

- **Good:**
  - one less service to run, pay for and secure on Railway
  - nothing to keep in sync: the index updates from Medusa's own events, plus our `fitment.changed` event
  - Medusa migrates and re-seeds the index when its definition changes
- **Watch:**
  - relevance tuning is simpler than in Meilisearch
  - Postgres does the search work, so we should check query time at ~2,000 SKUs (Phase 5 load test)
- **Escape hatch:** the search module takes other providers (custom provider API), so Meilisearch or Algolia can be added later without changing the storefront's calls to `/store/search`.
- **Testing:** the Medusa test runner doesn't run the search boot steps (`db:migrate-search` and seeding), so search behaviour is tested in the storefront E2E suite against a fully booted backend. Unit tests cover the helpers.
- Index prices are kept in INR only (`helpers/pricing.ts`).
