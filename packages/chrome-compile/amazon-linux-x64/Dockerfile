# =============================================================================
# Dockerfile — Chromium 157 headless_shell build environment
#
# Based on Amazon Linux 2023 x86_64.
# System libraries ARE bundled for self-contained Amazon Linux deployment.
# =============================================================================
FROM amazonlinux:2023

# --- Install build dependencies ---
# AL2023 base image ships curl-minimal which conflicts with full curl;
# swap it first (same fix as lambda-arm64).
# Split into two layers: core build tools, then Chromium-specific dev libs.
RUN dnf swap -y curl-minimal curl && \
    dnf install -y \
    gcc \
    gcc-c++ \
    make \
    git \
    clang \
    python3 \
    python3-pip \
    perl \
    ruby \
    rust \
    cargo \
    tar \
    unzip \
    wget \
    zip \
    nano \
    bc \
    gperf \
    which \
    findutils \
    diffutils \
    patch \
    pkg-config \
    && dnf clean all

RUN dnf install -y \
    alsa-lib-devel \
    atk-devel \
    bluez-libs-devel \
    bzip2-devel \
    cairo-devel \
    cups-devel \
    dbus-devel \
    dbus-glib-devel \
    expat-devel \
    gtk3-devel \
    libatomic \
    libcap-devel \
    libcurl-devel \
    libdrm-devel \
    libjpeg-devel \
    libuuid-devel \
    libXScrnSaver-devel \
    libxkbcommon-x11-devel \
    libxml2-devel \
    nspr-devel \
    nss-devel \
    openssl-devel \
    pam-devel \
    pciutils-devel \
    && dnf clean all

# --- Create python symlink (AL2023 has python3 only) ---
RUN ln -sf /usr/bin/python3 /usr/bin/python

# --- Copy build files ---
COPY build-chromium.sh /root/build-chromium.sh
COPY dot-gclient /root/dot-gclient
COPY args.gn /root/args.gn
COPY remotion-shared-memory-v3.patch /root/remotion-shared-memory-v3.patch
COPY probe-fast-path.py /root/probe-fast-path.py

RUN chmod +x /root/build-chromium.sh
