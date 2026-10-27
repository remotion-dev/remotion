# Chromium 157 Headless Shell - ARM64 Build Guide

For EC2 launches, set `SSH_CIDR` to the public IPv4 range allowed to connect (normally your address with `/32`). `203.0.113.10/32` in the examples is a placeholder.

Build Chromium 157.0.8080.0 `headless_shell` for ARM64 (aarch64) inside a Docker container based on the AWS Lambda Node.js 24 image (Amazon Linux 2023).

Output: `chromium-headless-shell-amazon-linux2023-arm64.zip` (~84 MB)
containing `headless_shell` + shared libraries inside the
`chromium-headless-shell-amazon-linux2023-arm64/` subdirectory required by
Remotion's `BrowserFetcher`. See the top-level `README.md` →
"Output zip layout requirements" for why the wrapping subdir is mandatory.

## Infrastructure

- **EC2**: c7g.8xlarge (32 ARM64 vCPU, 64 GiB RAM, Graviton3), 200 GiB gp3, eu-central-1
- **Docker base image**: `public.ecr.aws/lambda/nodejs:24.2026.01.26.23`
- **Build time**: ~2 h 35 min total (checkout and sync ~15 min, LLVM ~30 min, Rust/Crubit ~5 min, Chromium compile ~1 h 45 min)
- **Chromium**: 157.0.8080.0
- **Node.js**: v24.12.0 (whatever `third_party/node/update_node_binaries` declares)
- **Rust**: rust-lang/rust CI build of the commit in `third_party/rust-toolchain/VERSION`

## Files

| File                | Purpose                                                              |
| ------------------- | -------------------------------------------------------------------- |
| `launch-ec2.sh`     | Provisions the EC2 instance (AMI lookup, key pair, security group)   |
| `setup-ec2.sh`      | Runs on EC2: installs Docker, builds image, runs build, extracts zip |
| `Dockerfile`        | Build container with all system dependencies                         |
| `build-chromium.sh` | Main build script (runs inside container)                            |
| `args.gn`           | Chromium GN build flags for headless ARM64                           |
| `.gclient`          | gclient config (copied as `dot-gclient` in Docker context)           |
| `.env`              | AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)       |

## Quick Start (Ideal Path)

```bash
# 1. Launch EC2
SSH_CIDR=203.0.113.10/32 ./launch-ec2.sh

# 2. SCP files to EC2
scp -i chrome-build-key.pem Dockerfile build-chromium.sh ../shared/.gclient args.gn setup-ec2.sh \
  ../mac-arm64/remotion-shared-memory-v3.patch ../mac-arm64/probe-fast-path.py \
  ec2-user@<IP>:/home/ec2-user/

# 3. SSH in and run
ssh -i chrome-build-key.pem ec2-user@<IP> \
  'sudo cp /home/ec2-user/{Dockerfile,build-chromium.sh,.gclient,args.gn,setup-ec2.sh,remotion-shared-memory-v3.patch,probe-fast-path.py} /root/ && sudo bash /root/setup-ec2.sh'

# 4. Copy result back
ssh -i chrome-build-key.pem ec2-user@<IP> \
  'sudo cp /root/chromium-headless-shell-amazon-linux2023-arm64.zip /home/ec2-user/ && sudo chown ec2-user:ec2-user /home/ec2-user/chromium-headless-shell-amazon-linux2023-arm64.zip'
scp -i chrome-build-key.pem \
  ec2-user@<IP>:/home/ec2-user/chromium-headless-shell-amazon-linux2023-arm64.zip .
```

## v157-specific changes

1. **`gn gen` only generates `headless_shell`'s graph.** The full Chrome graph
   no longer evaluates with printing disabled (for example
   `//chrome/browser/ui/browser_web_contents_delegate` depends on
   `//components/printing/browser`, and `//printing` asserts
   `enable_printing`). Step 15 appends `root = "//headless:headless_shell"` and
   `root_patterns = [ "//headless:headless_shell" ]` to `.gn`, so every gn
   invocation (including the `gn desc` run by the `LICENSE.headless_shell`
   action) uses that graph. This replaces the 149 assert patcher and printing
   stubs, which are no longer needed.
2. `enable_background_mode`, `enable_captive_portal_detection` and
   `enable_chrome_notifications` were dropped from `args.gn` (Chromium 151+).
3. The LLVM bootstrap PIC/libxml2 injection matches 157's multi-line
   `bootstrap_args = (...)` expression and fails loudly if missing.
4. `strip` skips zero-byte `libEGL.so` / `libGLESv2.so` placeholders.
5. `setup-ec2.sh` keeps the container running and starts the build with
   `docker exec`, so a failed step can be fixed and resumed in place.
6. **Rust matches Chromium's toolchain exactly.** Blink needs headers from
   Crubit's `cc_bindings_from_rs`, which rejects crates compiled by any other
   rustc, and Chromium's toolchain is x86_64-only. Step 13 installs
   rust-lang/rust CI builds of commit `1edd55dcfcd573872c727fa3e086369a71661ee0`,
   builds `cc_bindings_from_rs` with `tools/rust/build_crubit.py`, and swaps
   the x86_64 `clang-format` Crubit runs for the LLVM build's. LLVM is
   `llvmorg-24-init-7747-g62397f8b`.
7. **Python 3.11 before LLVM (Step 5.5).** 157's `tools/clang/scripts/build.py`
   parses `...Z` timestamps with `datetime.fromisoformat`, which fails on
   AL2023's Python 3.9 (`Invalid isoformat string`) and made every LLVM
   attempt exit before `libclang.so` was built.
8. Step 6 replaces the x86_64 native TypeScript compiler
   (`third_party/typescript/linux-amd64`) with the same npm release for arm64.
9. **`optimize_for_size = true`** in `args.gn`: `-Os` for C/C++ and
   `-Copt-level=s` for Rust instead of `-O2` / `-Copt-level=3`. The zip
   shrinks from 96.5 MB to 83.7 MB (229.3 → 198.1 MB unpacked). See the
   top-level `README.md` for the speed comparison with the `-O2` build.
10. Step 2's git low-speed abort window is 10 minutes instead of 60 s.
    googlesource took more than a minute to start sending the depth-1 pack of
    the 157 tag (October 2026), so all four clone attempts failed with
    `curl 28 Operation too slow`.

## v149-specific things that broke (and how they are fixed)

This list is what actually caused failures during the 149.0.7790.0 build and
were not issues on 144. The `build-chromium.sh` in this directory already
incorporates all of them; the list is for posterity.

1. `**gn gen` asserts on force-disabled subsystems.** v149 `chrome/...`
   BUILD.gn files unconditionally reference modules we used to disable
   (`enable_extensions`, `enable_platform_apps`, `enable_compose`,
   `enable_glic`, `enable_mdns`, `enable_service_discovery`,
   `enable_click_to_call`, `enable_bound_session_credentials`,
   `enable_device_bound_sessions`). These flags have been **removed\*\* from
   `args.gn`; Chromium's defaults are fine — unused code still isn't linked
   into `headless_shell`.
2. `**use_system_minigbm = false`\*\* was added to `args.gn`; without it,
   `gn gen` fails looking for a system `gbm` library.
3. **PDF and printing are now enabled** (`enable_pdf = true`,
   `enable_printing = true`, `enable_print_preview = true`).
4. `**autoninja.py` requires Python ≥ 3.11\*\* — previously 3.10 was enough.
   AL2023's system Python 3.9 is far too old. Symlink vpython's 3.11 (Step 5.5).
5. **Node.js bumped to v24.12.0** (from v24.11.1). Read the version dynamically
   from `third_party/node/update_node_binaries` instead of hard-coding.
6. **Rust nightly is now `nightly-2026-02-28`**, derived from the bundled
   rustc commit in `third_party/rust-toolchain/VERSION`. Must be installed
   with `--component rustfmt --component rust-src`.
7. `**bindgen-cli` and a full set of Rust host tools must be symlinked\*\* into
   `third_party/rust-toolchain/bin/`. v149 generates Rust bindings via
   `log_severity_bindgen_generator` and similar targets that reference each
   tool directly. Required: `rustc`, `cargo`, `rustfmt`, `rustdoc`,
   `clippy-driver`, `cargo-clippy`, `cargo-fmt`, `bindgen`.
8. **LLVM bootstrap PIC patch location changed.** On 149 the matcher must
   target `"bootstrap_args = base_cmake_args + compiler_wrapper_cmake_args +  [\n"`. The old 144 pattern silently no-ops and you then see
   `R_AARCH64_ADR_PREL_PG_HI21` relocation errors linking `libclang.so`.
9. **Clone from `chromium.googlesource.com`, not `github.com/chromium/chromium`**.
   GitHub's mirror is >10× slower for shallow clones of specific tags.
10. **The Step 2 `http.lowSpeedLimit` git setting must be removed before the
    LLVM build.** `tools/clang/scripts/build.py` does a full `git clone` of
    llvm-project, and googlesource spends more than 60 s preparing that pack
    before sending any bytes, so every attempt died with
    `curl 28 Operation too slow` (September 2026, v3 build). The script now
    unsets `http.lowSpeedLimit`/`http.lowSpeedTime` right before Step 10.

## Shared-memory capture on Lambda (patch v3)

Lambda has no `/dev/shm`, so the v2 patch's `shm_open()` failed there with
`Could not create Remotion shared memory`. The v3 patch falls back to a
file-backed `MAP_SHARED` pool inside the `backingDirectory` that Remotion passes
(a private directory under `/tmp`), and FFmpeg's `remotionshm` device maps the
same file through `-pool_dir`. The build's probe forces the `file` backend once
to prove the code path works in this binary; the actual Lambda validation is a
real invocation through `@remotion/lambda`, since the build container still has
a `/dev/shm`.

Two Lambda-specific findings from the first v3 build (September 2026):

- Chromium itself needs `--disable-dev-shm-usage` on hosts without `/dev/shm`
  (Remotion passes it on Linux; the probe does too).
- `fallocate()` on Lambda's `/tmp` fails with `EPERM`. The patch therefore only
  treats `ENOSPC`/`EDQUOT`/`EFBIG` as fatal and otherwise reserves the pool by
  writing zeros.

### Lambda smoke test

Build-container success is not sufficient. Before the hosted layers are
updated, run the new binary through a real Lambda invocation:

1. Publish a private test layer from the zip in an AWS account you control:

   ```bash
   ./make-test-layer.sh ../output/chromium-headless-shell-amazon-linux2023-arm64.zip <bucket> eu-central-1
   ```

2. From a Remotion checkout whose `packages/compositor-linux-arm64-gnu` contains
   an FFmpeg with the `remotionshm` device and `-pool_dir` support, build the
   function ZIP (`cd packages/lambda && bun run make && bun run makeruntime`) and
   deploy a function with `deployFunction({customLayerArns: [<hosted fonts layer>,
<printed LayerVersionArn>], memorySizeInMb: 6144, ...})`. Deploy a second
   function with the currently hosted Chromium layer for an A/B comparison.

3. Render with `renderMediaOnLambda({logLevel: 'verbose', imageFormat: 'png',
framesPerLambda: <all frames>, ...})` and again with `jpeg`, verify the
   output frame count with `ffprobe -count_frames`, and confirm these lines in
   the renderer's CloudWatch log group:

   ```text
   [renderMedia()] Parallel encoding is enabled.
   Remotion shared-memory capture uses the file backend in /tmp/react-motion-render.../shm-pools-...
   [prespawnFfmpeg()] ... -f,remotionshm ... -pool_dir,/tmp/... -i,remotion ...
   ```

   A run that logs `Remotion shared-memory capture is unavailable. Falling back
to encoded screenshots. Reason: ...` rendered through the fallback and does
   not validate the binary; the reason names the failing syscall.

4. Also render with more than one chunk (`framesPerLambda` smaller than the
   frame count) to cover the concatenation of pre-encoded `h264-ts` chunks, and
   compare the decoded frames of the shared-memory render with the fallback
   render.

## Critical Corrections to `build-chromium.sh`

The checked-in `build-chromium.sh` incorporates all of the fixes below. This
section describes what each fix does and why, so future agents can adapt it
to later Chromium versions.

### Step 6: Node.js version

`update_node_binaries` on ARM64 pulls the x64 tarball and symlinks it the
wrong way. Read the version it declares and download the arm64 build directly:

```bash
cd /root/chromium/src/third_party/node/linux
rm -rf node-linux-x64 node-linux-arm64
NODE_VERSION=$(grep -E '^NODE_VERSION=' \
  /root/chromium/src/third_party/node/update_node_binaries \
  | head -1 | cut -d'"' -f2)      # v24.12.0 for Chromium 149.0.7790.0
wget -q "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-arm64.tar.gz" -O node-arm64.tar.gz
tar xzf node-arm64.tar.gz
mv "node-${NODE_VERSION}-linux-arm64" node-linux-arm64
ln -sf node-linux-arm64 node-linux-x64
rm -f node-arm64.tar.gz
```

### Step 10: LLVM/Clang Build - PIC for libclang.so

bindgen requires a **shared** `libclang.so`, but the default LLVM build produces only static archives. `build.py` must be patched to use PIC (Position Independent Code) for the **final** build stage while keeping PIC off for bootstrap.

On Chromium 149 the exact pattern to match changed. The bootstrap args are
now built as `bootstrap_args = base_cmake_args + compiler_wrapper_cmake_args + [...]`;
inject the PIC-off and libxml2-off flags at the top of that list:

```python
marker = "bootstrap_args = base_cmake_args + compiler_wrapper_cmake_args + [\n"
insert = (marker +
          "      '-DLLVM_ENABLE_PIC=OFF',\n"
          "      '-DLLVM_ENABLE_LIBXML2=OFF',\n")
src = src.replace(marker, insert, 1)
```

Then for the final stage:

1. REMOVE the `f'-DLLVM_ENABLE_PIC={pic_mode}'` entry from `base_cmake_args`.
2. ADD to final cmake_args: `-DLLVM_ENABLE_PIC=ON` and `-DCMAKE_POSITION_INDEPENDENT_CODE=ON`.
3. Strip non-aarch64 triples (`i386`, `x86_64`, `armv7`, `riscv64`) from `runtimes_triples_args`.

The LLVM build will **partially fail** - `libclang-cpp.so` will fail to link, but `libclang.so` will be built successfully before that failure. This is fine. Commit the container state at this point and continue.

After the LLVM build, copy `libclang.so`\* from the LLVM build dir into `third_party/rust-toolchain/lib/`:

```bash
LLVM_LIB=/root/chromium/src/third_party/llvm-build/Release+Asserts/lib
cp -P "$LLVM_LIB"/libclang.so* /root/chromium/src/third_party/rust-toolchain/lib/
export LIBCLANG_PATH=/root/chromium/src/third_party/rust-toolchain/lib
```

### Step 10: LLVM Build - Additional Patches

These patches are also needed in `tools/clang/scripts/build.py`:

- **Remove `riscv64` sysroot download**: The script tries to download Debian sysroots via `cipd`. Remove the riscv64 sysroot fetch or patch it to use `wget` instead:
  ```python
  # Remove riscv64 from LLVM_BUILTIN_TARGETS and LLVM_RUNTIME_TARGETS cmake args
  ```
- **Remove x86/armv7 runtime triples**: Only keep `aarch64-unknown-linux-gnu` in `runtimes_triples_args`
- **Fix bootstrap targets**: Change `bootstrap_targets = 'X86'` to `'ARM;AArch64'`

### Step 11: Do NOT Use tmpfs

The original script mounts a 48GB tmpfs for `out/Headless`. This will cause the **final link step** to fail with "No space left on device" because ThinLTO needs 50GB+ of temp space and the machine only has 64GB RAM. **Use disk instead**:

```bash
mkdir -p /root/chromium/src/out/Headless
# Do NOT mount tmpfs
cp /root/args.gn /root/chromium/src/out/Headless/args.gn
```

### Step 13: Rust Version - THE CRITICAL FIX

Chromium bundles a **custom-patched** rustc pinned to a specific upstream
commit. The bundled library source uses internal lang items
(`format_placeholder`, `format_count`) and compiler attributes that only exist
in a narrow window of rustc nightlies. Using the wrong date breaks the build
with either "unknown lang item" or rejected `-Z` flags.

**The only reliable way is to derive the nightly date from the bundled
rustc's commit hash**, which Chromium records in
`third_party/rust-toolchain/VERSION`:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"

RUST_COMMIT=$(cat third_party/rust-toolchain/VERSION | awk '{print $3}' | head -1)
COMMIT_DATE_ISO=$(curl -s \
  https://api.github.com/repos/rust-lang/rust/commits/$RUST_COMMIT \
  | jq -r .commit.committer.date)
# Nightlies are built from the previous day's tip, so +1 day matches:
RUST_NIGHTLY_DATE=$(date -u -d "$COMMIT_DATE_ISO +1 day" +%Y-%m-%d)
# For 149.0.7790.0 this resolves to 2026-02-28

rustup toolchain install "nightly-$RUST_NIGHTLY_DATE" \
  --profile minimal --component rustfmt --component rust-src
rustup default "nightly-$RUST_NIGHTLY_DATE"

# Chromium looks up EVERY host tool under third_party/rust-toolchain/bin/.
# Use actual binary paths from the toolchain dir, not rustup proxies.
TC=$(dirname "$(dirname "$(rustup which rustc)")")
for bin in rustc cargo rustfmt rustdoc clippy-driver cargo-clippy cargo-fmt; do
  [ -f "$TC/bin/$bin" ] && ln -sf "$TC/bin/$bin" \
    third_party/rust-toolchain/bin/$bin
done

# bindgen is not part of rustup:
cargo install bindgen-cli 2>/dev/null || cargo install bindgen-cli --version 0.72.1
ln -sf "$(which bindgen)" third_party/rust-toolchain/bin/bindgen

# Rust stdlib .so + rustlib layout also need to land in rust-toolchain/lib:
cp -P "$TC"/lib/*.so*      third_party/rust-toolchain/lib/ 2>/dev/null || true
mkdir -p                   third_party/rust-toolchain/lib/rustlib
cp -rP "$TC"/lib/rustlib/* third_party/rust-toolchain/lib/rustlib/
```

**What does NOT work:**

- Rust stable: rejects `-Z` flags required by Chromium's build system.
- A rustup-generated `rustc` proxy symlink: `run_build_script.py` fails with
  `KeyError: 'host'`.
- A nightly from a different month than the bundled rustc commit: typically
  `unknown lang item: format_placeholder` or `format_count`.
- A nightly installed _without_ `rustfmt` or `rust-src`: autoninja fails with
  `"third_party/rust-toolchain/bin/rustfmt" missing`.

### Step 5.5: Python Version

System Python 3.9 on AL2023 is too old for Chromium 149 — `autoninja.py` now
`from enum import StrEnum`, which only exists in Python ≥ 3.11 (Chromium 144
already needed 3.10+ for `type | type` union syntax). Use the Python 3.11 that
vpython downloads during `gclient sync`:

```bash
VPYTHON3=$(ls -d /root/.cache/vpython-root.0/store/cpython+*/contents/bin/python3.11 \
            2>/dev/null | head -1)
if [ -n "$VPYTHON3" ] && [ -x "$VPYTHON3" ]; then
  ln -sf "$VPYTHON3" /usr/local/bin/python3
  ln -sf "$VPYTHON3" /usr/local/bin/python
  ln -sf "$VPYTHON3" /usr/bin/python3      # shadow the system 3.9
fi
```

### Step 15: depot_tools Python Path

depot_tools needs to find the correct Python:

```bash
mkdir -p /root/depot_tools/.cipd_bin
ln -sf /usr/local/bin/python3 /root/depot_tools/.cipd_bin/python3
echo ".cipd_bin" > /root/depot_tools/python3_bin_reldir.txt
```

### Step 15: Environment Variables for Build

```bash
export LIBCLANG_PATH=/root/chromium/src/third_party/rust-toolchain/lib
export LD_LIBRARY_PATH="${LIBCLANG_PATH}:${LD_LIBRARY_PATH:-}"
```

## Recommended Build Strategy

Because the LLVM build partially fails and Docker container state needs to be preserved between stages, the build is best done in phases:

1. **Phase 1 (Steps 1-9)**: Run inside Docker. Commit container state as `chrome-builder-step10`.
2. **Phase 2 (Step 10 - LLVM)**: Run from `chrome-builder-step10`. LLVM build will partially fail (expected). Commit as `chrome-builder-llvm-pic`.
3. **Phase 3 (Steps 11-16)**: Run from `chrome-builder-llvm-pic`. This is the Chromium compile + package step.

Use `docker commit <container> <image-name>` to save state between phases. Use `--privileged` flag when running containers (needed for tmpfs if used, and binfmt_misc).

## Output Contents

The output zip is `chromium-headless-shell-amazon-linux2023-arm64.zip`.
All files live inside a top-level
`chromium-headless-shell-amazon-linux2023-arm64/` directory (required by
Remotion's `BrowserFetcher` — see top-level `README.md`).

It contains 18 files:

| File                        | Size   | Description                                 |
| --------------------------- | ------ | ------------------------------------------- |
| `headless_shell`            | ~179MB | Chromium headless browser binary (stripped) |
| `libEGL.so`                 | 0.3MB  | EGL graphics (stripped)                     |
| `libGLESv2.so`              | 5.2MB  | OpenGL ES (stripped)                        |
| `libvk_swiftshader.so`      | 16MB   | Software Vulkan renderer (stripped)         |
| `libvulkan.so.1`            | 0.6MB  | Vulkan loader (stripped)                    |
| `vk_swiftshader_icd.json`   | 0.1KB  | Vulkan ICD config                           |
| `libnss3.so`                | 1.3MB  | NSS                                         |
| `libnspr4.so`               | 0.3MB  | NSPR                                        |
| `libsoftokn3.so`            | 0.5MB  | NSS soft token                              |
| `libexpat.so.1`             | 0.3MB  | XML parser                                  |
| `libplc4.so`                | 0.2MB  | NSPR utility                                |
| `libplds4.so`               | 0.2MB  | NSPR data structures                        |
| `libfreebl3.so`             | 0.2MB  | NSS crypto                                  |
| `libfreeblpriv3.so`         | 0.7MB  | NSS crypto (private)                        |
| `libnssutil3.so`            | 0.3MB  | NSS utility                                 |
| `libdbus-1.so.3`            | 0.5MB  | D-Bus IPC                                   |
| `libgcc_s-14-20250110.so.1` | 0.3MB  | GCC runtime                                 |
| `libsystemd.so.0`           | 1.0MB  | systemd integration                         |

**Important**: The last 4 libraries (`libnssutil3.so`, `libdbus-1.so.3`, `libgcc_s-14-20250110.so.1`, `libsystemd.so.0`) are also required at runtime but were missing from the original build script. They must be copied from `/usr/lib64/` in the build container.

### Stripping Binaries

All build-output binaries must be stripped to remove debug symbols. This saves significant space:

| Binary                 | Unstripped | Stripped | Saved |
| ---------------------- | ---------- | -------- | ----- |
| `headless_shell`       | 263MB      | 179MB    | 84MB  |
| `libvk_swiftshader.so` | 24MB       | 16MB     | 8MB   |
| `libGLESv2.so`         | 7.7MB      | 5.2MB    | 2.5MB |
| `libvulkan.so.1`       | 842KB      | 633KB    | 209KB |
| `libEGL.so`            | 408KB      | 257KB    | 151KB |

```bash
cd /root/chromium/src
for bin in out/Headless/headless_shell out/Headless/libEGL.so out/Headless/libGLESv2.so \
           out/Headless/libvk_swiftshader.so out/Headless/libvulkan.so.1; do
  strip "$bin"
done
```

### Packaging

Files MUST be wrapped in a top-level
`chromium-headless-shell-amazon-linux2023-arm64/` directory — Remotion's
`BrowserFetcher` looks for that exact subdir name in its `possibleSubdirs`
list. Without it, extraction silently produces a path that
`getExecutablePath` can't find on AL2023 arm64.

```bash
OUTPUT_DIR="chromium-headless-shell-amazon-linux2023-arm64"
mkdir -p "final/${OUTPUT_DIR}"
cp out/Headless/headless_shell        "final/${OUTPUT_DIR}/"
cp out/Headless/libEGL.so             "final/${OUTPUT_DIR}/"
cp out/Headless/libGLESv2.so          "final/${OUTPUT_DIR}/"
cp out/Headless/libvk_swiftshader.so  "final/${OUTPUT_DIR}/"
cp out/Headless/libvulkan.so.1        "final/${OUTPUT_DIR}/"
cp out/Headless/vk_swiftshader_icd.json "final/${OUTPUT_DIR}/"

for lib in libnss3.so libnssutil3.so libsoftokn3.so libnspr4.so libexpat.so.1 \
           libplc4.so libplds4.so libfreebl3.so libfreeblpriv3.so \
           libdbus-1.so.3 libgcc_s-14-20250110.so.1 libsystemd.so.0; do
  [ -f "/lib64/$lib" ] && cp "/lib64/$lib" "final/${OUTPUT_DIR}/$lib" || \
  [ -f "/usr/lib64/$lib" ] && cp "/usr/lib64/$lib" "final/${OUTPUT_DIR}/$lib" || \
  echo "WARNING: $lib not found"
done

cd final && zip -r "${OUTPUT_DIR}.zip" "${OUTPUT_DIR}"
```

## Troubleshooting

| Error                                                            | Cause                                  | Fix                                                       |
| ---------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------- |
| `gn gen` asserts on `enable_extensions=false` etc.               | v149 build graph is stricter           | Remove those flags from `args.gn`                         |
| `cannot import name 'StrEnum' from 'enum'`                       | Python < 3.11                          | Symlink vpython's 3.11 into `/usr/local/bin/python3`      |
| `python3_bin_reldir.txt not found`                               | depot_tools Python path                | Write `.cipd_bin` + symlink python3 (Step 15)             |
| `unknown lang item: format_placeholder` / `format_count`         | Wrong Rust nightly                     | Derive date from `third_party/rust-toolchain/VERSION`     |
| `the option 'Z' is only accepted on the nightly compiler`        | Using stable Rust                      | Must use nightly                                          |
| `KeyError: 'host'` in `run_build_script.py`                      | `rustc` symlink points to rustup proxy | Symlink the actual binary under the toolchain dir         |
| `"third_party/rust-toolchain/bin/bindgen" missing`               | bindgen not installed                  | `cargo install bindgen-cli` + symlink                     |
| `"third_party/rust-toolchain/bin/rustfmt" missing`               | nightly installed without rustfmt      | `rustup … --component rustfmt` + symlink                  |
| `recompile with -fPIC` / relocation errors linking `libclang.so` | Bootstrap PIC=OFF flag not applied     | Update Python patch to target the 149 `build.py` marker   |
| `No space left on device` during ThinLTO link                    | tmpfs too small                        | Don't use tmpfs for `out/`                                |
| `No space left on device` during `docker commit`                 | 200 GB gp3 full                        | Skip intermediate commits; prefer `docker exec -d`        |
| `error: cannot install while Rust is installed`                  | rustup conflict with system rust       | Non-fatal with `-y` flag                                  |
| Node.js version mismatch                                         | Wrong Node for bundled version         | Read from `update_node_binaries`, download arm64 directly |
