#!/usr/bin/env bash
# Regenerate (or check) the screenshot baselines inside the same Linux Docker image
# CI uses, so fonts and anti-aliasing match pixel for pixel.
#
#   scripts/visual-baselines.sh           update baselines (commit the PNGs it writes)
#   scripts/visual-baselines.sh --check   only compare, like CI
#
# Needs Docker. Works from Git Bash on Windows, macOS and Linux.
set -euo pipefail

IMAGE="mcr.microsoft.com/playwright:v1.64.1-noble"
ROOT="$(cd "$(dirname "$0")/.." && (pwd -W 2>/dev/null || pwd))"
UPDATE="--update-snapshots"
[[ "${1:-}" == "--check" ]] && UPDATE=""

MSYS_NO_PATHCONV=1 docker run --rm -e UPDATE="$UPDATE" -v "$ROOT:/src" -w /work "$IMAGE" bash -euo pipefail -c '
  # Work on a copy so the host node_modules (Windows binaries) are never touched.
  tar -C /src --exclude=node_modules --exclude=.git --exclude=.next --exclude=.medusa \
      --exclude=storybook-static --exclude=test-results --exclude=.turbo -cf - . | tar -xf -
  npm install -g pnpm@10.34.9 >/dev/null 2>&1
  pnpm install --frozen-lockfile --filter "@autoparts/storefront..." --filter "@autoparts/ui..." >/dev/null
  pnpm --filter @autoparts/storefront build >/dev/null
  pnpm --filter @autoparts/ui build:storybook >/dev/null
  status=0
  (cd apps/storefront && VISUAL=1 CI=1 pnpm exec playwright test $UPDATE) || status=$?
  (cd packages/ui && CI=1 pnpm exec playwright test $UPDATE) || status=$?
  if [ -n "$UPDATE" ]; then
    for d in apps/storefront/e2e/__screenshots__ packages/ui/e2e/__screenshots__; do
      rm -rf "/src/$d" && cp -r "$d" "/src/$d"
    done
    echo "Baselines written. Review them, then commit."
  fi
  exit $status
'
