#!/usr/bin/env bash
#
# Cut a production release: zip of everything the server needs to build &
# run the app, EXCEPT the data folder (the production database stays here).
#
# Usage:
#   ./scripts/release.sh              # release named after git + date
#   ./scripts/release.sh 1.4.0        # release named 1.4.0
#
# Output: release/rssreader2-<name>.zip

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

NAME="${1:-}"
if [ -z "$NAME" ]; then
  DATE="$(date +%Y%m%d-%H%M%S)"
  if git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
    HASH="$(git -C "$ROOT" rev-parse --short HEAD)"
    NAME="${DATE}-${HASH}"
  else
    NAME="${DATE}"
  fi
fi

# ---------------------------------------------------------------------------
# Files/folders the server needs:
#   - Docker builds happen ON the server (docker compose up --build), so the
#     full source is required: src/, res/, tsconfig, package manifests.
#   - drizzle/ holds the migrations, reverse-proxy/ holds the nginx setup.
#   - .env carries BETTER_AUTH_URL/SECRET for compose's env_file.
# Deliberately NOT included (regenerated on the server, or must never ship):
#   - node_modules, dist, public  (build artifacts)
#   - data                        (production database — never overwrite it)
#   - .git, scripts               (not needed to run the app)
# ---------------------------------------------------------------------------
PATHS=(
  Dockerfile
  .dockerignore
  docker-compose.prod.yml
  package.json
  package-lock.json
  tsconfig.json
  .env.example
  src
  res
  drizzle
  reverse-proxy
)

# The server needs .env (compose env_file); ship it so setup stays one step.
[ -f .env ] && PATHS+=(".env")

# Safety net: data/ must never end up in the archive.
for p in "${PATHS[@]}"; do
  case "$p" in
    data|data/*|*/data|*/data/*)
      echo "ERROR: refusing to package data/ folder" >&2
      exit 1
      ;;
  esac
done

OUT_DIR="$ROOT/release"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

# Stage into a top-level folder so unzip doesn't scatter files around.
BUNDLE="rssreader2-${NAME}"
mkdir -p "$STAGE/$BUNDLE" "$OUT_DIR"

echo "Staging release ${BUNDLE} ..."
for p in "${PATHS[@]}"; do
  if [ ! -e "$p" ]; then
    echo "  skipping missing: $p"
    continue
  fi
  mkdir -p "$STAGE/$BUNDLE/$(dirname "$p")"
  cp -a "$p" "$STAGE/$BUNDLE/$p"
done

# Belt and braces: confirm data/ really isn't in the bundle.
if [ -e "$STAGE/$BUNDLE/data" ]; then
  echo "ERROR: data/ folder snuck into the bundle" >&2
  exit 1
fi

ZIP="$OUT_DIR/${BUNDLE}.zip"
rm -f "$ZIP"

echo "Zipping -> $ZIP"
(cd "$STAGE" && zip -rq "$ZIP" "$BUNDLE")

SIZE="$(du -h "$ZIP" | cut -f1)"
echo
echo "Release ready: release/${BUNDLE}.zip (${SIZE})"
echo "Upload with:   scp release/${BUNDLE}.zip user@server:/path/to/dest/"
echo "Then on server: unzip ${BUNDLE}.zip -d /path/to/dest/"
