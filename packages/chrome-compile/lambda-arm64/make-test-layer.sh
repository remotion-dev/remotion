#!/bin/bash
# Publish a private Lambda layer from a chrome-compile Lambda zip for a real
# Lambda smoke test before the hosted layers are updated.
#
# The layer mirrors the layout of the hosted remotion-binaries-chromium-arm64
# layer: bin/chromium (the headless_shell executable), the GL/Vulkan libraries
# next to it, and the bundled Amazon Linux runtime libraries in lib/.
#
# Usage:
#   ./make-test-layer.sh <chromium-headless-shell-amazon-linux2023-arm64.zip> <s3-bucket> [region] [layer-name]
#
# Then deploy a test function with @remotion/lambda's deployFunction() and
# customLayerArns: [<hosted fonts layer ARN>, <printed LayerVersionArn>], render
# with logLevel "verbose", and look for these lines in the renderer's CloudWatch
# log group (see README.md, "Lambda smoke test"):
#   Remotion shared-memory capture uses the file backend in /tmp/...
#   [prespawnFfmpeg()] ... -f,remotionshm ... -pool_dir,/tmp/... -i,remotion
set -euo pipefail
ZIP="${1:?chromium zip}"
BUCKET="${2:?s3 bucket in the target account}"
REGION="${3:-eu-central-1}"
LAYER_NAME="${4:-remotion-test-chromium-arm64}"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
mkdir -p "$work/x" "$work/layer/bin" "$work/layer/lib"
unzip -q "$ZIP" -d "$work/x"
src="$work/x/chromium-headless-shell-amazon-linux2023-arm64"
test -f "$src/headless_shell"
cp "$src/headless_shell" "$work/layer/bin/chromium"
chmod 755 "$work/layer/bin/chromium"
for f in libEGL.so libGLESv2.so libvk_swiftshader.so libvulkan.so.1 vk_swiftshader_icd.json; do
  cp "$src/$f" "$work/layer/bin/"
done
for f in "$src"/*.so "$src"/*.so.*; do
  case "$(basename "$f")" in
    libEGL.so|libGLESv2.so|libvk_swiftshader.so|libvulkan.so.1) ;;
    *) cp "$f" "$work/layer/lib/" ;;
  esac
done
(cd "$work/layer" && zip -qr -X "$work/layer.zip" .)
KEY="layers/${LAYER_NAME}-$(date -u +%Y%m%d%H%M%S).zip"
aws s3 cp "$work/layer.zip" "s3://$BUCKET/$KEY" --region "$REGION" --only-show-errors
aws lambda publish-layer-version --region "$REGION" --layer-name "$LAYER_NAME" \
  --description "Chromium headless_shell test layer from $(basename "$ZIP")" \
  --license-info "Chromium, compiled from source. https://chromium.googlesource.com/chromium/src/+/refs/heads/main/LICENSE" \
  --content "S3Bucket=$BUCKET,S3Key=$KEY" \
  --compatible-runtimes nodejs24.x --compatible-architectures arm64 \
  --query '{LayerVersionArn:LayerVersionArn,Version:Version,CodeSize:Content.CodeSize}' --output json
