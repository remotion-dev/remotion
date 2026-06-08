#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

image="${IMAGE:-remotion-issue-8198-node-24-select-composition}"
node_version="${NODE_VERSION:-24.16.0}"
remotion_version="${REMOTION_VERSION:-4.0.447}"
timeout_ms="${SELECT_COMPOSITION_TIMEOUT_MS:-120000}"
tag="$image:node-$node_version-remotion-$remotion_version"

docker build \
  --build-arg NODE_VERSION="$node_version" \
  --build-arg REMOTION_VERSION="$remotion_version" \
  -t "$tag" \
  .
docker run --rm -e SELECT_COMPOSITION_TIMEOUT_MS="$timeout_ms" "$tag"
