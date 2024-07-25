set -e
cd ../renderer
bun build-browser-downloader.ts
cp ensure-browser.mjs ../dockerfiles/ensure-browser.mjs
cd ../dockerfiles
docker build --file Dockerfile.al2023 . --output type=tar,dest=/dev/null --progress=plain
docker build --file Dockerfile.ubuntu . --output type=tar,dest=/dev/null --progress=plain
docker build --file Dockerfile.debian . --output type=tar,dest=/dev/null --progress=plain
docker build --file Dockerfile.nix . --output type=tar,dest=/dev/null --progress=plain
