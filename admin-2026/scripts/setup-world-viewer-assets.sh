#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRAMEWORK_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RSC_ROOT="$(cd "$FRAMEWORK_ROOT/.." && pwd)"
ASSET_SITE="${WORLD3D_SITE:-$RSC_ROOT/rsc-map-renderer-gh-pages}"
UPSTREAM="${WORLD3D_ASSET_REPO:-https://github.com/swazrgb/rsc-map-renderer.git}"

if [[ ! -d "$ASSET_SITE/.git" ]]; then
  echo "==> cloning baked gh-pages assets"
  git clone --depth 1 --branch gh-pages "$UPSTREAM" "$ASSET_SITE"
else
  echo "==> baked asset checkout already exists: $ASSET_SITE"
fi

mkdir -p "$ASSET_SITE/api/items" "$ASSET_SITE/api/demo"

# Published gh-pages assets currently use /api/world/*.json while this viewer
# fork still requests the immediately preceding endpoint names.
ln -sfn ../world/boundaries.json "$ASSET_SITE/api/world3d/boundaries.json"
ln -sfn ../world/scenery.json "$ASSET_SITE/api/map/scenery.json"
ln -sfn world/npc-spawns.json "$ASSET_SITE/api/npc-spawns"
ln -sfn ../world/wearables.json "$ASSET_SITE/api/items/wearables"

# Current gh-pages no longer publishes the old synthetic wander-track payload.
# An empty compatible payload renders the static world with no live entities.
cat > "$ASSET_SITE/api/demo/entities.json" <<'JSON'
{"tickMs":640,"names":{},"npcs":[],"players":[]}
JSON

echo "==> world viewer assets ready"
echo "    WORLD3D_SITE=$ASSET_SITE"
