# Chromium 157 headless_shell — Linux ARM64

For EC2 launches, set `SSH_CIDR` to the public IPv4 range allowed to connect (normally your address with `/32`). `203.0.113.10/32` in the examples is a placeholder.

Builds Chromium **157.0.8080.0** `headless_shell` for generic Debian/Ubuntu
ARM64 (glibc ≥ 2.35), with proprietary codecs and PDF support.

## Overview

- **Target**: Ubuntu 22.04 / Debian 12 ARM64 (glibc ≥ 2.35)
- **Output**: `chromium-headless-shell-linux-arm64.zip` (~88 MB), containing
  `chrome-headless-shell-linux-arm64/headless_shell` (the wrapping folder name
  matches the `chrome-headless-shell-${platform}` template Remotion's
  `BrowserFetcher` builds; see top-level `README.md` →
  "Output zip layout requirements")
- **Build time**: ~2 h 4 min on `c7g.8xlarge` (32 Graviton3 vCPUs) once everything works
- **Build environment**: `ubuntu:22.04` in Docker

This is the hardest variant. The ARM64 `linux-arm64` build has to
bootstrap LLVM from source (no pre-built toolchain), work around a missing
CIPD package for `gperf`, and install/symlink a lot of Rust host tooling that
the bundled `rust-toolchain/bin/` dir ships without.

## Chromium 157 notes

Changes relative to the 149 recipe (details in the root `README.md`):

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

| File                | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| `launch-ec2.sh`     | Provisions c7g.8xlarge + key pair + security group        |
| `setup-ec2.sh`      | EC2 bootstrap: install Docker, build image, run the build |
| `Dockerfile`        | Ubuntu 22.04 build container with every system dep        |
| `build-chromium.sh` | Main build script, runs inside the container              |
| `args.gn`           | GN flags (see parent README for the shared base)          |
| `.gclient`          | gclient config (shallow, small checkout, no NaCl)         |

## args.gn

```gn
import("//build/args/headless.gn")
dcheck_always_on = false
is_official_build = true
symbol_level = 0
blink_symbol_level = 0
v8_symbol_level = 0

enable_keystone_registration_framework = false
enable_linux_installer = false
enable_media_remoting = false
enable_swiftshader_vulkan = false

ffmpeg_branding = "Chrome"
proprietary_codecs = true
headless_use_embedded_resources = true
icu_use_data_file = false

is_debug = false
target_cpu = "arm64"
v8_target_cpu = "arm64"
target_os = "linux"

use_cups = false
use_pulseaudio = false
use_sysroot = false
use_qt = false
use_dawn = false
skia_use_dawn = false
use_system_minigbm = false

enable_pdf = true
enable_printing = true
enable_print_preview = true
enable_lens_desktop = false
use_on_device_model_service = false

chrome_pgo_phase = 0
enable_background_mode = false
enable_captive_portal_detection = false
enable_chrome_notifications = false

clang_use_chrome_plugins = false
```

**Key flags explained**

- `proprietary_codecs = true` + `ffmpeg_branding = "Chrome"` — H.264/AAC.
- `headless_use_embedded_resources = true` — embed `.pak` resources in the binary.
- `icu_use_data_file = false` — embed ICU data in the binary.
- `use_sysroot = false` — link against system libraries instead of Chromium's sysroot.
- `use_dawn = false` + `skia_use_dawn = false` — disable Dawn/WebGPU (build errors otherwise).
- `use_system_minigbm = false` — new in 149, avoids `gn gen` asking for a system `gbm`.
- `clang_use_chrome_plugins = false` — the bootstrap clang has no Chrome plugins.

**Flags that MUST NOT be set in 149** (they break `gn gen`):

- `enable_extensions`, `enable_platform_apps`, `enable_compose`, `enable_glic`,
  `enable_mdns`, `enable_service_discovery`, `enable_click_to_call`,
  `enable_bound_session_credentials`, `enable_device_bound_sessions`.

## .gclient

```python
solutions = [
  {
    "name": "src",
    "url": "https://chromium.googlesource.com/chromium/src.git@157.0.8080.0",
    "managed": False,
    "custom_deps": {},
    "custom_vars": {
      "checkout_nacl": False,
      "checkout_configuration": "small",
    },
  },
]
```

**Use `chromium.googlesource.com`, not `github.com/chromium/chromium`.** The
GitHub mirror is unusably slow for shallow clones of specific tags (we observed

> 1 h before fixing this).

## Prerequisites

- **Instance**: `c7g.8xlarge` — 32 Graviton3 vCPU, 64 GiB RAM
- **Storage**: 200 GiB gp3 (200 GB is only just enough; see caveat on
  `docker commit` below)
- **AMI**: Amazon Linux 2023 for the host; build happens inside `ubuntu:22.04`
- **Region**: eu-central-1 (or any region with Graviton3)

## Build steps (what `build-chromium.sh` runs)

The script is deliberately a single run — we learned the hard way that
`docker commit` on 200 GB disks fills up during long builds. If you must
checkpoint, do it _before_ cloning Chromium, not after LLVM.

```
 1.  Install depot_tools
 2.  Clone Chromium (chromium.googlesource.com, shallow, tag 157.0.8080.0)
 3.  Sync depot_tools to the Chromium commit date
 4.  Patch DEPS: gperf CIPD → host_cpu == "x64" only
 5.  gclient sync --no-history --shallow
 5.5 Symlink vpython's Python 3.11 → /usr/local/bin/{python,python3}
 6.  Node.js: read NODE_VERSION from update_node_binaries, download arm64
 7.  Symlink system gperf into third_party/gperf/cipd/bin/gperf
 8.  Java for build steps
 9.  Build Ninja from source (after `ln -sf /usr/bin/python3 /usr/bin/python`)
10.  LLVM bootstrap via tools/clang/scripts/build.py with patches (see below)
11.  Rust nightly matching bundled rustc commit, with rustfmt + rust-src
12.  cargo install bindgen-cli + symlink every host tool into rust-toolchain/bin
13.  Copy Rust stdlib *.so + lib/rustlib into rust-toolchain/lib
14.  Fix GCC paths (link crtbeginS.o / crtendS.o)
15.  depot_tools python3_bin_reldir.txt + /.cipd_bin/python3 symlink
16.  gn gen + autoninja headless_shell
17.  Strip + zip
```

### Step 10 — LLVM patches

`tools/clang/scripts/build.py` needs this Python patch applied:

```python
marker = "bootstrap_args = base_cmake_args + compiler_wrapper_cmake_args + [\n"
insert = (marker +
          "      '-DLLVM_ENABLE_PIC=OFF',\n"
          "      '-DLLVM_ENABLE_LIBXML2=OFF',\n")
src = src.replace(marker, insert, 1)
```

Then:

- Remove `-DLLVM_ENABLE_LLD=ON` (bootstrap can't use lld before it's built).
- Remove the ML inlining model block (needs network downloads we don't allow).
- Add `-lrt -lpthread` to `cxxflags`.
- Change `bootstrap_targets = 'X86'` → `'ARM;AArch64'`.
- Flip `pic_default = sys.platform == 'win32'` → `pic_default = True` for the
  final (non-bootstrap) install, and append to the final `cmake_args`:
  ```
  '-DLLVM_ENABLE_PIC=ON',
  '-DCMAKE_POSITION_INDEPENDENT_CODE=ON',
  ```
- Strip non-aarch64 triples (`i386`, `x86_64`, `armv7`, `riscv64`) from
  `runtimes_triples_args`.

Run:

```bash
git config --global user.email "build@localhost"
git config --global user.name "Build"

./tools/clang/scripts/build.py \
  --without-android --without-fuchsia \
  --use-system-cmake \
  --host-cc /usr/bin/clang --host-cxx /usr/bin/clang++ \
  --bootstrap || true      # libclang-cpp.so may fail to link — that's fine
```

After:

```bash
LLVM_LIB=/root/chromium/src/third_party/llvm-build/Release+Asserts/lib
mkdir -p third_party/rust-toolchain/lib
cp -P "$LLVM_LIB"/libclang.so* third_party/rust-toolchain/lib/
echo "llvmorg-23-init-5669-g8a0be0bc-4" > "$LLVM_LIB/../cr_build_revision"
```

### Step 11 — Rust nightly

```bash
RUST_COMMIT=$(cat third_party/rust-toolchain/VERSION | awk '{print $3}')
COMMIT_DATE_ISO=$(curl -s \
  https://api.github.com/repos/rust-lang/rust/commits/$RUST_COMMIT \
  | jq -r .commit.committer.date)
RUST_NIGHTLY_DATE=$(date -u -d "$COMMIT_DATE_ISO +1 day" +%Y-%m-%d)
# For 149.0.7790.0 this resolves to 2026-02-28 (157 no longer uses a nightly)

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustup toolchain install "nightly-$RUST_NIGHTLY_DATE" \
  --profile minimal --component rustfmt --component rust-src
rustup default "nightly-$RUST_NIGHTLY_DATE"
```

### Step 12 — Populate `third_party/rust-toolchain/bin/`

```bash
cargo install bindgen-cli         # or --version 0.72.1 if tip of trunk breaks

TC=$(dirname "$(dirname "$(rustup which rustc)")")
for bin in rustc cargo rustfmt rustdoc clippy-driver cargo-clippy cargo-fmt; do
  [ -f "$TC/bin/$bin" ] && ln -sf "$TC/bin/$bin" \
    third_party/rust-toolchain/bin/$bin
done
ln -sf "$(which bindgen)" third_party/rust-toolchain/bin/bindgen

# Also the stdlib .so and rustlib layout Chromium expects:
cp -P "$TC"/lib/*.so*     third_party/rust-toolchain/lib/ 2>/dev/null || true
mkdir -p                  third_party/rust-toolchain/lib/rustlib
cp -rP "$TC"/lib/rustlib/* third_party/rust-toolchain/lib/rustlib/
```

### Step 15 — depot_tools Python path

```bash
mkdir -p /root/depot_tools/.cipd_bin
ln -sf "$(readlink -f /usr/local/bin/python3)" /root/depot_tools/.cipd_bin/python3
echo ".cipd_bin" > /root/depot_tools/python3_bin_reldir.txt
```

### Step 16 — gn gen + autoninja

```bash
export LIBCLANG_PATH=/root/chromium/src/third_party/rust-toolchain/lib
export LD_LIBRARY_PATH="$LIBCLANG_PATH:${LD_LIBRARY_PATH:-}"

gn gen out/Headless
autoninja -C out/Headless headless_shell
```

## Output

```
chrome-headless-shell-linux-arm64/
├── headless_shell         (~75 MB stripped)
├── libEGL.so              (~0.3 MB)
├── libGLESv2.so           (~5 MB)
├── libvk_swiftshader.so   (~14 MB)
├── libvulkan.so.1         (~0.6 MB)
└── vk_swiftshader_icd.json
```

Total zip: ~88 MB.

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

## Common build errors (and what actually bit us on 149)

### `ERROR at //build/config/linux/dri/BUILD.gn:11:20: … Package dri was not found`

**Cause**: `gn gen` calls `pkg-config dri` which needs `dri.pc`.
**Fix**: the Dockerfile now installs `mesa-common-dev`. If you hit it on a
running container: `apt-get install -y mesa-common-dev`.

### `python3_bin_reldir.txt not found. need to initialize depot_tools …`

**Cause**: depot*tools can't locate its own Python binary.
**Fix**: the Step 15 snippet above. This is \_not* the same as the
`/usr/local/bin/python3` symlink; both are required.

### `ImportError: cannot import name 'StrEnum' from 'enum'`

**Cause**: `autoninja.py` on 149 requires Python ≥ 3.11; Ubuntu 22.04 has 3.10.
**Fix**: Step 5.5 — symlink vpython's Python 3.11:

```bash
PY311=$(ls -d /root/.cache/vpython-root.0/store/cpython+*/contents/bin/python3.11 | head -1)
ln -sf "$PY311" /usr/local/bin/python3
ln -sf "$PY311" /usr/local/bin/python
```

### `"third_party/rust-toolchain/bin/bindgen", needed by … missing and no known rule to make it`

**Cause**: `bindgen` isn't part of rustup.
**Fix**: `cargo install bindgen-cli` + symlink (Step 12).

### `"third_party/rust-toolchain/bin/rustfmt", needed by … missing`

**Cause**: default nightly doesn't include rustfmt.
**Fix**: install with `--component rustfmt` (Step 11) and symlink (Step 12).

### `/usr/bin/env: 'python': No such file or directory` during Ninja build

**Cause**: Ninja's `configure.py` uses `#!/usr/bin/env python`. Ubuntu 22.04
has no `python`, only `python3`.
**Fix**: `ln -sf /usr/bin/python3 /usr/bin/python` before running Step 9.

### `no such package: infra/3pp/tools/gperf/linux-arm64`

**Cause**: the CIPD package simply doesn't have a linux-arm64 build.
**Fix**: DEPS patch restricting to `x64`, then symlink the apt-installed
`/usr/bin/gperf` into `third_party/gperf/cipd/bin/gperf` (Step 7).

### LLVM link failure: `can't create dynamic relocation R_AARCH64_ADR_PREL_PG_HI21 against symbol … in readonly segment`

**Cause**: the bootstrap patch placed `-DLLVM_ENABLE_PIC=OFF` in the wrong list
(a pattern mismatch against 149's `build.py`), so bootstrap static libs were
PIC=ON and conflicted when linking shared `libclang.so`.
**Fix**: the marker is
`"bootstrap_args = base_cmake_args + compiler_wrapper_cmake_args + [\n"`; see
Step 10. If a stale `llvm-bootstrap` and `llvm-build/Release+Asserts` already
exist, `rm -rf` them and restart — CMake caches the bad flags otherwise.

### Git cherry-pick fails during LLVM checkout

**Cause**: no git identity in the container.
**Fix**:

```bash
git config --global user.email "build@localhost"
git config --global user.name "Build"
```

### `cr_build_revision` mismatch after LLVM patch

**Cause**: the revision string in the LLVM build dir is compared against
`tools/clang/scripts/update.py`'s expectation.
**Fix**: for 149.0.7790.0 write exactly
`llvmorg-23-init-5669-g8a0be0bc-4`.

### `docker commit` fails with `no space left on device`

**Cause**: 200 GB gp3 fills up mid-build (Chromium source + gclient deps +
LLVM + `out/Headless` ≈ 150 GB alone; committing the container image ≈ +40 GB).
**Fix**: avoid intermediate commits. Use `docker exec -d chrome-build bash -c
"..." > log 2>&1` to resume a broken script inside the running container, and
only commit the final image after success.

### `autoninja` error: `obj/... → phony/... → bindgen|rustfmt missing`

**Cause**: re-ran `gn gen` without first populating
`third_party/rust-toolchain/bin/{bindgen,rustfmt,rustc,...}`.
**Fix**: redo Step 12 before re-invoking autoninja. `gn gen` itself does not
need these, but the generated siso graph references them.

## What went wrong specifically during the 149 build

Posterity notes from the 149.0.7790.0 run:

1. **Shallow clone from `github.com/chromium/chromium`** took > 1 h before
   switching to `chromium.googlesource.com`. Fixed permanently in the script.
2. **Missing `python` symlink** tanked the Ninja-from-source build at step 9.
3. **`mesa-common-dev`** was not in the Dockerfile; `gn gen` failed on
   `dri.pc`. Now in the Dockerfile.
4. **`docker commit` on a 200 GB disk** ran out of space and the container was
   lost. The whole build was restarted from scratch; subsequent runs skip
   intermediate commits.
5. **LLVM PIC patch** was placed in the wrong `build.py` list due to a pattern
   mismatch vs 149. The fix above targets the correct `bootstrap_args` line.
   The recovery path was to `rm -rf third_party/llvm-bootstrap
third_party/llvm-build/Release+Asserts` and rerun `build.py`.
6. **Resumed `gn gen` missed three steps** that the full script does after
   Rust setup: writing `depot_tools/python3_bin_reldir.txt`, installing
   `bindgen-cli`, and symlinking `rustc/cargo/rustfmt/...` into
   `third_party/rust-toolchain/bin/`. Each missing step produced its own
   autoninja failure (see troubleshooting table above).

Total wall-clock was dominated by the LLVM rebuild (~13 min), the Rust compile
of `bindgen-cli` (~6 min), and the final autoninja (~2 h 4 min); everything
else was seconds to single-digit minutes.

## Files in this directory

- `args.gn` — GN build configuration
- `Dockerfile` — Ubuntu 22.04 build environment (now with `mesa-common-dev`)
- `launch-ec2.sh` — launch EC2 instance
- `setup-ec2.sh` — setup script for EC2 host
- `build-chromium.sh` — end-to-end build script inside the container
- `.gclient` — gclient configuration
