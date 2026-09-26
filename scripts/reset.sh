#!/usr/bin/env bash
# Restores the local database to seed data, so every Epic Review starts from
# the same known state. Touches nothing outside .local/.
#   ./scripts/reset.sh                 empty store (the epic-01 demo loads the ERP)
#   ./scripts/reset.sh --after-epic 01 the state the epic-01 demo leaves
set -euo pipefail
cd "$(dirname "$0")/.."
# Absolute, because npm runs workspace scripts from the workspace directory.
export DATABASE_FILE="$PWD/.local/portal.db"
mkdir -p .local
for f in .local/portal.db .local/portal.db-wal .local/portal.db-shm; do
  [ -f "$f" ] && rm -- "$f"
done
npm run seed --workspace apps/server --silent -- "$@"
