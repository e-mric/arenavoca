#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mode="${1:-app}"
if (($#)); then shift; fi
case "$mode" in
  docs)
    node --test scripts/workflow.test.mjs
    node scripts/check-docs.mjs "$@"
    ;;
  app)
    cd app
    npm run check
    npm run test:e2e -- "$@"
    ;;
  *) echo "Usage: bash scripts/verify.sh {docs [markdown files...]|app [browser specs...]}" >&2; exit 2 ;;
esac
