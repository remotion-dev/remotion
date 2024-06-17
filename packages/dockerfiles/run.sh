set -e
docker build --file Dockerfile.ubuntu . --output type=tar,dest=/dev/null --progress=plain
docker build --file Dockerfile.debian . --output type=tar,dest=/dev/null --progress=plain
