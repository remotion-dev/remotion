#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="/opt/homebrew/bin:$PATH"

for command in git python3 xcrun pkgutil codesign zip unzip shasum; do
  if ! command -v "$command" >/dev/null; then
    echo "Missing required command: $command" >&2
    exit 1
  fi
done

if [ "$(uname -s)" != Darwin ] || [ "$(uname -m)" != arm64 ]; then
  echo 'This build must run natively on macOS ARM64.' >&2
  exit 1
fi

export CHROMIUM_BUILD_JOBS="${CHROMIUM_BUILD_JOBS:-8}"
echo "Starting Chromium with $CHROMIUM_BUILD_JOBS parallel compile jobs."
exec /usr/bin/caffeinate -dimsu /bin/bash "$SCRIPT_DIR/build-chromium.sh"
