#!/bin/bash
set -euo pipefail

# =============================================================================
# setup-ec2.sh — Run on the EC2 instance after SSH login (as root)
#
# Installs Docker, builds the Chromium build image, runs the build, and
# extracts chromium-headless-shell-amazon-linux2023-arm64.zip.
# =============================================================================

ZIP_NAME="chromium-headless-shell-amazon-linux2023-arm64.zip"

echo "=== Installing Docker ==="
dnf install -y docker
systemctl start docker
systemctl enable docker

echo "=== Pulling Lambda base image ==="
docker pull public.ecr.aws/lambda/nodejs:24.2026.01.26.23

echo "=== Building Docker image ==="
# Copy build files to a build context directory
BUILD_DIR="/root/chrome-build"
mkdir -p "$BUILD_DIR"

# Copy all needed files into the build context
cp /root/setup-ec2.sh "$BUILD_DIR/" 2>/dev/null || true
cp /root/Dockerfile "$BUILD_DIR/"
cp /root/build-chromium.sh "$BUILD_DIR/"
cp /root/.gclient "$BUILD_DIR/dot-gclient"
cp /root/args.gn "$BUILD_DIR/"
cp /root/remotion-shared-memory-v3.patch "$BUILD_DIR/"
cp /root/probe-fast-path.py "$BUILD_DIR/"

cd "$BUILD_DIR"
docker build -t chrome-builder .

echo "=== Running build container ==="
# Keep the container running after a failed step so the build can be fixed
# and resumed with `docker exec` instead of restarting it or committing a
# ~50 GB container layer.
docker run -d --name chrome-build \
  --privileged \
  --memory=60g \
  --cpus=$(nproc) \
  chrome-builder \
  sleep infinity
docker exec chrome-build bash /root/build-chromium.sh

echo "=== Extracting ${ZIP_NAME} ==="
docker cp "chrome-build:/root/chromium/src/final/${ZIP_NAME}" "/root/${ZIP_NAME}"

echo ""
echo "========================================="
echo "Build complete!"
echo "Output: /root/${ZIP_NAME}"
echo "========================================="
echo ""
echo "Copy it out with:"
echo "  scp -i chrome-build-key.pem ec2-user@<IP>:/root/${ZIP_NAME} ."
