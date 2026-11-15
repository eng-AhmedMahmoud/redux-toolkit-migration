#!/usr/bin/env bash
# The merge gate (this repo is not on Jenkins): clean install, then the
# production static export that scripts/deploy.sh ships.
#   bash scripts/ci-local.sh
set -euo pipefail
cd "$(dirname "$0")/.."

npm ci --no-audit --no-fund
npm run build
test -f out/404.html
echo "ci-local: all steps passed"
