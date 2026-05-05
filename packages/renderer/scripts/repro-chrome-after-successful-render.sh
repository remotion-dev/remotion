#!/usr/bin/env bash
# Repro helper for https://github.com/remotion-dev/remotion/issues/7065
# (Chrome or zombie processes still visible after a *successful* render.)
#
# After the CLI render exits 0, prints matching processes. On Linux this should
# normally show no chrome-headless-shell; if you still see it, the bug reproduces.
# Use `docker run --init` if you are checking zombies — bare PID1 in containers
# can leave unreaped <defunct> rows that are not the same as a live Chrome tree.
#
# Usage (from monorepo root, with bun in PATH):
#   ./packages/renderer/scripts/repro-chrome-after-successful-render.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
HELLO_ROOT="${REPO_ROOT}/packages/template-helloworld"
BUNDLE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/remotion-repro-bundle.XXXXXX")"
OUT_MP4="$(mktemp "${TMPDIR:-/tmp}/remotion-repro-out.XXXXXX.mp4")"

cleanup() {
	rm -rf "$BUNDLE_DIR" "$OUT_MP4" 2>/dev/null || true
}
trap cleanup EXIT

if [[ ! -d "$HELLO_ROOT" ]]; then
	echo "Expected ${HELLO_ROOT} (template-helloworld). Run from a full Remotion checkout."
	exit 1
fi

cd "$HELLO_ROOT"
echo "== Bundling template-helloworld =="
bunx remotion bundle src/index.ts --out-dir "$BUNDLE_DIR"

echo "== Rendering HelloWorld (short run) =="
bunx remotion render "$BUNDLE_DIR" HelloWorld "$OUT_MP4" --log=verbose

echo ""
echo "== After render exited successfully (issue #7065: look for leftover Chrome) =="
sleep 0.5

echo "-- ps lines mentioning chrome-headless / chromium (should usually be empty) --"
ps aux 2>/dev/null | grep -E '[c]hrome-headless|[c]hromium|[c]hrome-headless-shell' || echo "(none)"

echo ""
echo "-- zombie (Z) rows whose args mention chrome/remotion (Linux; often empty) --"
if ps -eo pid,ppid,stat,args >/dev/null 2>&1; then
	ps -eo pid,ppid,stat,args 2>/dev/null | awk '$3 ~ /^Z/ && (/[Cc]hrome|[Rr]emotion|[Cc]hromium/) {print}' | head -25 || echo "(none matched)"
else
	echo "(ps -eo not available)"
fi

echo ""
echo "Repro script finished. If chrome-headless-shell (or many [chrome*] zombies) appear above, file details in #7065."
