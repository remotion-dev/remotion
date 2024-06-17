set -e
docker build --file Dockerfile.al2023 . --output type=tar,dest=/dev/null --progress=plain
docker build --file Dockerfile.ubuntu . --output type=tar,dest=/dev/null --progress=plain
docker build --file Dockerfile.debian . --output type=tar,dest=/dev/null --progress=plain
