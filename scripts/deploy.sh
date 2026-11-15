#!/usr/bin/env bash
# Production deploy: https://redux-toolkit-migration.devya.dev, a static-assets
# Cloudflare Worker (wrangler.jsonc; the site left Vercel on 2026-11-15 and the
# old Vercel URL now redirects here). Builds the static export
# (`output: 'export'` → out/) from a clean install of the committed tree,
# uploads it with `wrangler deploy`, then checks the live URL. The custom
# domain creates its own DNS record in the devya.dev zone.
#   bash scripts/deploy.sh
# Needs a wrangler login on the Cloudflare account that owns devya.dev
# (`npx wrangler@4.156.0 whoami`).
set -euo pipefail
cd "$(dirname "$0")/.."

URL="https://redux-toolkit-migration.devya.dev"
WRANGLER=(npx --yes wrangler@4.156.0)

if [ -n "$(git status --porcelain)" ]; then
  echo "deploy: working tree is dirty; commit or stash first" >&2
  exit 1
fi

npm ci --no-audit --no-fund
npm run build

"${WRANGLER[@]}" deploy --message "$(git rev-parse --short HEAD) $(git log -1 --format=%s)"

# A new custom domain can take a minute to get its certificate.
for path in / /docs/introduction; do
  code=000
  for _ in $(seq 1 12); do
    code="$(curl -s -o /dev/null -m 20 -w '%{http_code}' "$URL$path" || true)"
    [ "$code" = 200 ] && break
    sleep 10
  done
  echo "deploy: $URL$path -> $code"
  [ "$code" = 200 ]
done
