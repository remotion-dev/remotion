#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

du -sh layers/chromium layers/fonts layers/emoji-apple layers/emoji-google layers/cjk
