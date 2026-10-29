# =============================================================================
# Dockerfile — Chromium 157 headless_shell build environment (Ubuntu 22.04 x86_64)
#
# Targets regular Linux distros (Debian/Ubuntu x86_64).
# System libraries are NOT bundled — user installs via apt on target.
# =============================================================================
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# --- Install build dependencies ---
RUN apt-get update && apt-get install -y \
    build-essential \
    clang \
    cmake \
    git \
    python3 \
    python3-pip \
    perl \
    ruby \
    curl \
    wget \
    tar \
    unzip \
    zip \
    gperf \
    patch \
    pkg-config \
    lsb-release \
    sudo \
    nano \
    bc \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y \
    libasound2-dev \
    libatk1.0-dev \
    libatk-bridge2.0-dev \
    libbluetooth-dev \
    libbz2-dev \
    libcairo2-dev \
    libcups2-dev \
    libdbus-1-dev \
    libdbus-glib-1-dev \
    libexpat1-dev \
    libgtk-3-dev \
    libatomic1 \
    libcap-dev \
    libcurl4-openssl-dev \
    libdrm-dev \
    libjpeg-dev \
    uuid-dev \
    libxss-dev \
    libxkbcommon-x11-dev \
    libxml2-dev \
    libnspr4-dev \
    libnss3-dev \
    libssl-dev \
    libpam0g-dev \
    libpci-dev \
    libgbm-dev \
    libxshmfence-dev \
    && rm -rf /var/lib/apt/lists/*

# --- Create python symlink (Ubuntu 22.04 has python3 only) ---
RUN ln -sf /usr/bin/python3 /usr/bin/python

# --- Copy build files ---
COPY build-chromium.sh /root/build-chromium.sh
COPY dot-gclient /root/dot-gclient
COPY args.gn /root/args.gn
COPY remotion-shared-memory-v3.patch /root/remotion-shared-memory-v3.patch
COPY probe-fast-path.py /root/probe-fast-path.py

RUN chmod +x /root/build-chromium.sh
