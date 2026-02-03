set -e
cd ../renderer
bun build-browser-downloader.ts
cp ensure-browser.mjs ../dockerfiles/ensure-browser.mjs
cd ../dockerfiles

# Build the browser-test bundle from packages/example
echo "Building browser-test bundle..."
cd ../example
bunx remotion bundle src/browser-test-entry.ts --out-dir ../dockerfiles/bundle
cd ../dockerfiles

echo "Bundle created at packages/dockerfiles/bundle"

# Create output directory for videos
mkdir -p out

# Function to build and extract video
build_and_extract() {
  local dockerfile=$1
  local tag=$2
  local output_name=$3

  echo "Building $tag..."
  docker build --file $dockerfile -t $tag .

  echo "Extracting video from $tag..."
  container_id=$(docker create $tag)
  docker cp $container_id:/usr/app/out.mp4 ./out/$output_name
  docker rm $container_id
  echo "Video saved to out/$output_name"
}

# build_and_extract Dockerfile.al2023 remotion-al2023 al2023.mp4
build_and_extract Dockerfile.ubuntu24 remotion-ubuntu24 ubuntu24.mp4
build_and_extract Dockerfile.ubuntu22 remotion-ubuntu22 ubuntu22.mp4
build_and_extract Dockerfile.debian remotion-debian debian.mp4
# build_and_extract Dockerfile.nix remotion-nix nix.mp4

echo ""
echo "All videos extracted to packages/dockerfiles/out/"
ls -la out/
