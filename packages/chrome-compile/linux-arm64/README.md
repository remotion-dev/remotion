# Chromium 157 headless_shell — Linux ARM64

For EC2 launches, set `SSH_CIDR` to the public IPv4 range allowed to connect (normally your address with `/32`). `203.0.113.10/32` in the examples is a placeholder.

Builds Chromium **157.0.8080.0** `headless_shell` for generic Debian/Ubuntu
ARM64 (glibc ≥ 2.35), with proprietary codecs and PDF support.

## Overview

- **Target**: Ubuntu 22.04 / Debian 12 ARM64 (glibc ≥ 2.35)
- **Output**: `chromium-headless-shell-linux-arm64.zip` containing
  `chrome-headless-shell-linux-arm64/headless_shell` (the wrapping folder name
  matches the `chrome-headless-shell-${platform}` template Remotion's
  `BrowserFetcher` builds; see top-level `README.md` →
  "Output zip layout requirements")
- **Build time**: ~2 h 30 min on `c7g.8xlarge` (32 Graviton3 vCPUs)
- **Build environment**: `ubuntu:22.04` in Docker

The ARM64 build bootstraps LLVM from source, supplies the missing ARM64 `gperf` dependency, and installs Rust tools matching Chromium’s toolchain commit.

## Chromium 157 notes

The Chromium 157 build script handles:

- `enable_background_mode`, `enable_captive_portal_detection`,
  `enable_chrome_notifications`, `enable_platform_apps` and
  `enable_lens_desktop` are no longer forced off: `//chrome/test` and other
  full-graph targets now assert on them during `gn gen`.
- The build compiles the patched `page_handler.cc` objects right after
  `gn gen`, so a shared-memory patch error fails within minutes.
- Chromium 157 reformatted `tools/clang/scripts/build.py`; the LLVM bootstrap
  PIC/libxml2 injection now matches the multi-line `bootstrap_args = (...)`
  expression and fails loudly if either injection point is missing.
- Rust: Chromium's toolchain is x86_64-only, and Crubit's
  `cc_bindings_from_rs` (needed by Blink since 157) rejects crates built by any
  other rustc. Step 13 installs rust-lang/rust CI builds of the exact commit
  Chromium's toolchain uses, builds `cc_bindings_from_rs` with
  `tools/rust/build_crubit.py`, and replaces the x86_64 `clang-format` that
  Crubit runs with the one from the LLVM build.
- Step 6 replaces the x86_64 native TypeScript compiler
  (`third_party/typescript/linux-amd64`) with the same npm release for arm64.
- `strip` skips zero-byte `libEGL.so` / `libGLESv2.so` placeholders.
- `setup-ec2.sh` keeps the container running and starts the build with
  `docker exec`, so a failed step can be fixed and resumed in place.

## Files

| File                                       | Purpose                                                   |
| ------------------------------------------ | --------------------------------------------------------- |
| `launch-ec2.sh`                            | Provisions c7g.8xlarge + key pair + security group        |
| `setup-ec2.sh`                             | EC2 bootstrap: install Docker, build image, run the build |
| `Dockerfile`                               | Ubuntu 22.04 build container with every system dep        |
| `build-chromium.sh`                        | Main build script, runs inside the container              |
| `args.gn`                                  | GN build flags for this platform                          |
| [`../shared/.gclient`](../shared/.gclient) | gclient config (shallow, small checkout, no NaCl)         |

## Build

Follow the [Linux quick start](../README.md#quick-start), using this directory's files. The build script handles the toolchain setup and packaging; [args.gn](args.gn) and [the shared gclient configuration](../shared/.gclient) are the configuration sources.

## Output

`chromium-headless-shell-linux-arm64.zip` contains `chrome-headless-shell-linux-arm64/headless_shell` and its supporting files. See the [ZIP layout requirements](../README.md#output-zip-layout-requirements).

## Target system runtime dependencies

```bash
sudo apt install -y \
  libnss3 libnspr4 libexpat1 libdbus-1-3 libgbm1 \
  libasound2 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
  libxkbcommon0 libx11-6 libxcomposite1 libxdamage1 libxext6 \
  libxfixes3 libxrandr2 libpango-1.0-0 libcairo2 fonts-liberation
```

## Testing

```bash
unzip chromium-headless-shell-linux-arm64.zip
./chrome-headless-shell-linux-arm64/headless_shell \
  --no-sandbox --headless --dump-dom https://example.com
```
