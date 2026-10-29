#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [ "$#" -gt 1 ] || { [ "$#" -eq 1 ] && [ "$1" != "--test" ]; }; then
    echo "Usage: bash upload.sh [--test]" >&2
    exit 1
fi

account=$(aws sts get-caller-identity --query Account --output text)
if [ "$account" != "678892195805" ]; then
    echo "Expected the Remotion AWS account (678892195805), got $account." >&2
    exit 1
fi

version=$(bun -p 'require("./binaries.json").version')
layers=(chromium fonts emoji-apple emoji-google cjk)
for layer in "${layers[@]}"; do
    unzip -tq "out/remotion-layer-$layer-v$version-arm64.zip"
done

if [ "${1:-}" = "--test" ]; then
    regions=(eu-central-1)
else
    regions=(eu-central-1 eu-central-2 eu-west-1 eu-west-2 eu-west-3 eu-south-1 eu-north-1 us-east-1 us-east-2 us-west-1 us-west-2 af-south-1 ap-south-1 ap-east-1 ap-southeast-1 ap-southeast-2 ap-northeast-1 ap-northeast-2 ap-northeast-3 ap-southeast-4 ap-southeast-5 ca-central-1 sa-east-1)
fi

for region in "${regions[@]}"; do
    for layer in "${layers[@]}"; do
        archive="remotion-layer-$layer-v$version-arm64.zip"
        aws s3 cp --region="$region" "out/$archive" "s3://remotionlambda-binaries-$region/$archive"
    done
done
