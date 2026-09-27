#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRAMEWORK_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RSC_ROOT="$(cd "$FRAMEWORK_ROOT/.." && pwd)"

ADMIN_WEB="$FRAMEWORK_ROOT/admin-2026/web"
RENDERER_REPO="${WORLD_VIEWER_REPO:-$RSC_ROOT/rsc-map-renderer-observe}"
ASSET_SITE="${WORLD3D_SITE:-$RSC_ROOT/rsc-map-renderer-gh-pages}"

VIEWER_HOST="${WORLD_VIEWER_HOST:-127.0.0.1}"
VIEWER_PORT="${WORLD_VIEWER_PORT:-5173}"
ADMIN_HOST="${ADMIN_WEB_HOST:-127.0.0.1}"
ADMIN_PORT="${ADMIN_WEB_PORT:-5186}"

if [[ ! -d "$RENDERER_REPO/viewer" ]]; then
  echo "Missing renderer checkout: $RENDERER_REPO" >&2
  exit 1
fi

if [[ ! -f "$ASSET_SITE/api/world3d/manifest.json" ]]; then
  echo "Missing baked assets. Run:" >&2
  echo "  $SCRIPT_DIR/setup-world-viewer-assets.sh" >&2
  exit 1
fi

cleanup() {
  trap - EXIT INT TERM
  [[ -n "${VIEWER_PID:-}" ]] && kill "$VIEWER_PID" 2>/dev/null || true
  [[ -n "${ADMIN_PID:-}" ]] && kill "$ADMIN_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> starting World Viewer on http://$VIEWER_HOST:$VIEWER_PORT"
(
  cd "$RENDERER_REPO/viewer"
  WORLD3D_SITE="$ASSET_SITE" npm run dev --     --host "$VIEWER_HOST" --port "$VIEWER_PORT" --strictPort
) &
VIEWER_PID=$!

echo "==> starting Admin 2026 on http://$ADMIN_HOST:$ADMIN_PORT"
(
  cd "$ADMIN_WEB"
  VITE_WORLD_VIEWER_URL="http://$VIEWER_HOST:$VIEWER_PORT" npm run dev --     --host "$ADMIN_HOST" --port "$ADMIN_PORT" --strictPort
) &
ADMIN_PID=$!

echo "==> World route: http://$ADMIN_HOST:$ADMIN_PORT/world"
echo "    Ctrl-C stops both frontend processes."

wait "$VIEWER_PID" "$ADMIN_PID"
