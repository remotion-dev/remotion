FROM ubuntu:22.04

ARG NODE_VERSION=24.16.0
ARG REMOTION_VERSION=4.0.447
ARG TARGETARCH

RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  curl \
  xz-utils \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libgbm-dev \
  libasound2 \
  libxrandr2 \
  libxkbcommon-dev \
  libxfixes3 \
  libxcomposite1 \
  libxdamage1 \
  libatk-bridge2.0-0 \
  libpango-1.0-0 \
  libcairo2 \
  libcups2 \
  && rm -rf /var/lib/apt/lists/*

RUN set -eux; \
  architecture="${TARGETARCH:-$(dpkg --print-architecture)}"; \
  case "$architecture" in \
    amd64) node_arch="x64" ;; \
    arm64) node_arch="arm64" ;; \
    *) echo "Unsupported architecture: $architecture" >&2; exit 1 ;; \
  esac; \
  curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${node_arch}.tar.xz"; \
  tar -xJf "node-v${NODE_VERSION}-linux-${node_arch}.tar.xz" -C /usr/local --strip-components=1; \
  rm "node-v${NODE_VERSION}-linux-${node_arch}.tar.xz"; \
  node --version; \
  npm --version

WORKDIR /usr/app

COPY repro-package.json ./package.json
RUN npm install --no-audit --no-fund \
  "@remotion/bundler@${REMOTION_VERSION}" \
  "@remotion/renderer@${REMOTION_VERSION}" \
  "remotion@${REMOTION_VERSION}" \
  "react@18.3.1" \
  "react-dom@18.3.1"

COPY render.mjs ./
COPY src ./src

CMD ["node", "render.mjs"]
