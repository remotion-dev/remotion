# @remotion/chrome-compile

Public build instructions and scripts imported from `remotion-dev/chrome-compile` at commit `6255f0237c39798faa0b803fa0bd17e842853487` (October 5, 2026). This is a private workspace package, so the source is public in the monorepo but the package is not published to npm.

## Use this package

From a Remotion checkout, run `bun install`, then `cd packages/chrome-compile`. Follow the platform guide below to compile Chromium. Builds and EC2 launches are explicit manual operations; normal dependency installation and monorepo builds do not compile Chromium, launch instances, or download binary archives.

The source import contains build scripts, configuration, patches, probes, and documentation. Generated ZIPs are hosted on `remotion.media` and excluded from Git. `artifacts.json` records each archive's SHA-256 and byte size, including the historical artifacts retained from the original repository. Older archives are retained for reference and may have obsolete layouts; check the [output ZIP layout requirements](#output-zip-layout-requirements) before using them.

```sh
# Show available archive paths without downloading anything.
bun run download --list

# Download the five current Chromium 157 archives.
bun run download

# Restore one historical archive when needed.
bun run download output/old-v138/chrome-headless-shell-linux64.zip
```

`bun run download --all` restores all recorded archive paths. Existing matching files are verified and reused. Existing files with different contents are preserved, so move your own build output before restoring a recorded artifact.

These downloads verify checksums and preserve the original ZIP bytes; they do not upgrade the browser version used by Remotion. Publishing a new browser build still requires validating its layout and runtime behavior as described below.

Build Chromium **157.0.8080.0** `headless_shell` with proprietary codecs
(H.264/AAC) for the platforms used by Remotion. The generic Linux and Amazon
Linux x64 builds include PDF/printing support; the Lambda build disables it and
is compiled with `optimize_for_size = true` to stay small. All five builds
apply Remotion's v3 shared-memory capture patch
(`mac-arm64/remotion-shared-memory-v3.patch`, rebased onto 157).

## Shared-memory capture patch (v3)

The patch adds private CDP commands (`Page.remotionCreateFramePool`,
`Page.remotionReleaseFrame`, `Page.remotionDestroyFramePool`) and raw BGRA
capture parameters on `Page.captureScreenshot`. v3 adds a second pool backend
for hosts without POSIX shared memory:

| Backend     | Storage                                                                                                  | Selected when                                                                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `posix-shm` | `shm_open("/rmshm-<random>")`, `/dev/shm` on Linux                                                       | Default; tried first. On Linux the pages are reserved up front (`fallocate`, or zero-fill where that is not permitted, as on Lambda's `/tmp`) so a full tmpfs (e.g. a 64 MB container `/dev/shm`) fails cleanly instead of SIGBUS. |
| `file`      | Regular file `<backingDirectory>/rmshm-<random>` (mode 0600, `O_EXCL`, `O_NOFOLLOW`) mapped `MAP_SHARED` | `shm_open` fails (AWS Lambda has no `/dev/shm`) and the caller passed `backingDirectory`, or `preferredBackend: "file"`.                                                                                                           |

Build status (October 2026): all five variants are built from 157.0.8080.0
with v3. Every build passed the probe in its build environment
(`autoBackend: posix-shm`, `fileBackend: file`). The zips were also run
outside it: Linux x64 (under emulation) and Linux ARM64 in Ubuntu 24.04
containers, the Lambda build in the AL2023 Lambda image, each with and without
`/dev/shm` (`autoBackend` falls back to `file` without it), and the macOS build
on an M4 Mac running macOS 15.7. WebGL and WebGL2 create SwiftShader contexts
on all of them. No 157 build has been tested on a real Lambda or in a
Remotion render yet.

| Variant                                          | remotion.media object                                                           |       Bytes | SHA-256                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------- | ----------: | ------------------------------------------------------------------ |
| [`linux-x64`](linux-x64/README.md)               | `chromium-headless-shell-linux-x64-157.0.8080.0.zip`                            | 103,668,996 | `7c4a2751b361aeb3cff3ed788fa18b7a0849371b983d478bb9205b6cc25a8c52` |
| [`linux-arm64`](linux-arm64/README.md)           | `chromium-headless-shell-linux-arm64-157.0.8080.0.zip`                          |  98,184,293 | `a28653057f53d2115c42445ff907f803b2ab9fc1aad77e98f95cf5fa619b2080` |
| [`amazon-linux-x64`](amazon-linux-x64/README.md) | `chromium-headless-shell-amazon-linux-x64-157.0.8080.0.zip`                     | 105,788,600 | `41135a7d7645ca94747e96a1591495e3d0d2cb8fac10e0d35da3ea37ae882520` |
| [`lambda-arm64`](lambda-arm64/README.md)         | `chromium-headless-shell-amazon-linux-arm64-157.0.8080.0-optimize-for-size.zip` |  83,681,211 | `eb5f2e34ab898c334eff08dcdd780650da85b5593872a135228758d48a481f61` |
| [`mac-arm64`](mac-arm64/README.md)               | `chromium-headless-shell-mac-arm64-157.0.8080.0.zip`                            | 179,230,663 | `3d9fd9a997915fa295ba6fbd66b2eaad2b9578101aa9dcde5e2eb737afa4f459` |

In 157, `libEGL`/`libGLESv2` are small shims and ANGLE is linked into the
browser binary, which accounts for most of the size increase over 149. The
149 v3 builds remain available as `...-149.0.7790.0-v3.zip`.

The Lambda build is compiled with `optimize_for_size = true` (`-Os` for C/C++,
`-Copt-level=s` for Rust). The `-O2` build of the same commit remains
available as `chromium-headless-shell-amazon-linux-arm64-157.0.8080.0.zip`
(96,507,420 bytes, SHA-256 `0becf9784c02c4d5c27fc930104b7e269ac941f88baff2ff2829f201839e2bcc`).
Compared with it, the size-optimized zip is 12.8 MB smaller (96.5 → 83.7 MB)
and 31.1 MB smaller unpacked (229.3 → 198.1 MB, nearly all of it
`headless_shell`), which is what counts towards Lambda's 250 MB limit. Both
builds were timed on a c7g.8xlarge (Graviton3) in the Lambda Python 3.12 image,
limited to 2 CPUs, with SwiftShader, rendering and capturing a busy 1920×1080
page frame by frame (five alternating rounds, 60 frames each):

| Per frame                 |  `-O2` | `optimize_for_size` |
| ------------------------- | -----: | ------------------: |
| JPEG capture              | 322 ms |              320 ms |
| Raw shared-memory capture | 311 ms |              312 ms |
| PNG capture               | 579 ms |        599 ms (+3%) |
| DOM build + layout        |  94 ms |       103 ms (+10%) |

Capture time on that page is dominated by SwiftShader's JIT-compiled
rasterization, which compiler flags don't affect; Blink's own C++ (style,
layout) and zlib got slower.

`remotionCreateFramePool` accepts optional `backingDirectory` (absolute path of
a private, caller-owned directory) and `preferredBackend` (`auto`, `posix-shm`,
`file`) and returns the chosen `backend`. Both processes map the same
page-cache pages, so visibility is identical to POSIX shm. The consumer
(FFmpeg's `remotionshm` device with `-pool_dir`) unlinks the name after
mapping it; Chromium also unlinks on pool destruction. Older callers that omit
the new parameters get the v2 behavior.

## Supported Platforms

| Directory                                        | Target                                | Instance     | Build time  | Output size | Output zip (script-emitted name)                     |
| ------------------------------------------------ | ------------------------------------- | ------------ | ----------- | ----------- | ---------------------------------------------------- |
| [`lambda-arm64`](lambda-arm64/README.md)         | AWS Lambda (Amazon Linux 2023, ARM64) | c7g.8xlarge  | ~2 h 35 min | ~84 MB      | `chromium-headless-shell-amazon-linux2023-arm64.zip` |
| [`linux-arm64`](linux-arm64/README.md)           | Debian/Ubuntu ARM64 (glibc ≥ 2.35)    | c7g.8xlarge  | ~2 h 30 min | ~98 MB      | `chromium-headless-shell-linux-arm64.zip`            |
| [`linux-x64`](linux-x64/README.md)               | Debian/Ubuntu x86_64 (glibc ≥ 2.35)   | c6i.8xlarge  | ~1 h 20 min | ~104 MB     | `chromium-headless-shell-linux64.zip`                |
| [`amazon-linux-x64`](amazon-linux-x64/README.md) | Amazon Linux 2023 x86_64              | c6i.8xlarge  | ~1 h 20 min | ~106 MB     | `chromium-headless-shell-amazon-linux2023-x64.zip`   |
| [`mac-arm64`](mac-arm64/README.md)               | macOS ARM64 (13.0+)                   | mac-m4.metal | ~2 h 5 min  | ~179 MB     | `chromium-headless-shell-mac-arm64.zip`              |

Fresh builds write their ZIPs to the ignored `output/` directories. At upload time, copy them to the versioned URL names consumed by `getChromeDownloadUrl` (`chromium-headless-shell-<platform>-<version>.zip`). Recorded build artifacts can be restored with `bun run download`; this package does not use Git LFS.

> **Read this before bumping the version.** See
> [Output zip layout requirements](#output-zip-layout-requirements) below — the
> zip layout is consumed by Remotion's `BrowserFetcher` and a single misnamed
> file or missing wrapping directory will silently break extraction at runtime.

## Output zip layout requirements

Remotion's `packages/renderer/src/browser/BrowserFetcher.ts` is opinionated
about what is inside each downloaded zip. `getExecutablePath` builds the path
to the binary from a hard-coded `<wrapping-folder>/<binary-name>` per
platform; if either part doesn't match, the renderer can't find Chromium even
though the download succeeded.

The build scripts in this repo MUST produce zips that match this table. When
you bump the Chromium version, re-verify each one.

| Variant                                          | Zip filename (in `output/`)                          | Wrapping folder inside zip                        | Binary name inside folder                          | Bundles system `.so`s?          |
| ------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------- | ------------------------------- |
| [`linux-x64`](linux-x64/README.md)               | `chromium-headless-shell-linux64.zip`                | `chrome-headless-shell-linux64/`                  | **`chrome-headless-shell`** (NOT `headless_shell`) | no                              |
| [`linux-arm64`](linux-arm64/README.md)           | `chromium-headless-shell-linux-arm64.zip`            | `chrome-headless-shell-linux-arm64/`              | `headless_shell`                                   | no                              |
| [`amazon-linux-x64`](amazon-linux-x64/README.md) | `chromium-headless-shell-amazon-linux2023-x64.zip`   | `chromium-headless-shell-amazon-linux2023-x64/`   | `headless_shell`                                   | yes — AL2023 needs them bundled |
| [`lambda-arm64`](lambda-arm64/README.md)         | `chromium-headless-shell-amazon-linux2023-arm64.zip` | `chromium-headless-shell-amazon-linux2023-arm64/` | `headless_shell`                                   | yes — AL2023 needs them bundled |

Notes / footguns:

1. **`linux-x64` binary rename is mandatory.** The Chromium build outputs the
   binary as `headless_shell` for every variant. For non-AL2023 `linux64` the
   renderer's `getExecutablePath` looks for `chrome-headless-shell`. The
   post-extract rename loop in `BrowserFetcher.ts` only fires when the binary
   is named `chrome`, so `headless_shell` is left untouched and extraction
   fails. Rename it to `chrome-headless-shell` at packaging time
   (`linux-x64/build-chromium.sh` does this).
2. **All five variants must have a wrapping subdirectory.** Files dumped at
   the zip root will not match `possibleSubdirs` and extraction fails. Two
   variants previously got this wrong:
   - 144's `chrome-headless-shell-linux-arm64.zip` used `chrome-linux/` and
     was renamed by the post-extract loop. 149+ already uses
     `chrome-headless-shell-linux-arm64/` — keep it that way.
   - The Lambda build historically produced `chromium.zip` with files at the
     root and was restructured by hand into
     `chromium-headless-shell-amazon-linux2023-arm64/`. As of v149 this is
     baked into `lambda-arm64/build-chromium.sh`; do not regress.
3. **`amazon-linux-*` zips bundle system libraries** because AL2023 / Lambda
   runtimes don't ship them at the locations Chromium expects.
   `linux-x64` and `linux-arm64` zips do NOT bundle them — the README target
   tells users to `apt install` them.
4. **The version-suffixed names** (`...-<version>.zip`, for example
   `...-157.0.8080.0.zip`) consumed by `getChromeDownloadUrl` are produced as
   a copy/rename step at upload time.
   The build scripts emit the short names from the table above.

## Quick start

For Linux, use the platform-specific EC2 and Docker instructions below. For
macOS ARM64, follow [the native Mac build guide](mac-arm64/README.md). The macOS
build pins Chromium 157 by commit independently; it does not use
`shared/.gclient`.

```bash
cd <platform-directory>
# Replace this example with the public IPv4 address allowed to connect.
SSH_CIDR=203.0.113.10/32 ./launch-ec2.sh
scp -i <key>.pem Dockerfile build-chromium.sh args.gn setup-ec2.sh \
  ../shared/.gclient ../mac-arm64/remotion-shared-memory-v3.patch \
  ../mac-arm64/probe-fast-path.py ec2-user@<IP>:/home/ec2-user/
ssh -i <key>.pem ec2-user@<IP> \
  'sudo cp /home/ec2-user/{Dockerfile,build-chromium.sh,args.gn,setup-ec2.sh,.gclient,remotion-shared-memory-v3.patch,probe-fast-path.py} /root/ && sudo bash /root/setup-ec2.sh'
ssh -i <key>.pem ec2-user@<IP> \
  'sudo cp /root/<output-zip-name> /home/ec2-user/ && sudo chown ec2-user:ec2-user /home/ec2-user/<output-zip-name>'
scp -i <key>.pem ec2-user@<IP>:/home/ec2-user/<output-zip-name> ../output/
aws ec2 terminate-instances --instance-ids <id> --region eu-central-1
```

If the AWS CLI session expires during a long build, refresh it with
`aws login --region eu-central-1` before retrieving instance details or
terminating the host.

Each Linux build checks that the patch applies to Chromium 157, compiles the
patched `page_handler.cc` objects first (so a patch error fails within
minutes), then compiles `headless_shell` and runs `probe-fast-path.py` before
packaging. The probe creates one pool per backend: an `auto` pool (POSIX
shared memory in the build container, read back from `/dev/shm`) and a forced
`file` pool in a private temporary directory. For each it captures a frame,
verifies the published bytes, releases the slot, destroys the pool, and checks
that no pool file is left behind. The private CDP method requires a trusted
DevTools pipe or the `--remotion-shared-memory-capture` opt-in flag. A Linux
container using POSIX shared memory needs enough `/dev/shm` space for its frame
pools; otherwise Chromium falls back to the file backend when a
`backingDirectory` is supplied. To exercise the automatic fallback locally,
run the probe in a container started with `--ipc=none`, which has no
`/dev/shm`.

## What changed going from Chromium 149 → 157

1. **Shared-memory patch rebase.** The v3 patch logic is unchanged. Only the
   DevTools method lists in `content/browser/devtools/protocol_config.json`
   and `third_party/blink/renderer/core/inspector/inspector_protocol_config.json`
   needed new context; the remaining hunks apply with offsets.
2. **More `gn gen` asserts on force-disabled subsystems.** Chromium 151 added
   `enable_background_mode`, `enable_captive_portal_detection` and
   `enable_chrome_notifications`; 157 adds `enable_platform_apps`
   (`//chrome/test` depends on `//apps:test_support`) and `enable_lens_desktop`
   (`//chrome/browser/ui/lens` asserts `enable_lens_overlay_backend`). The
   generic Linux and Amazon Linux x64 `args.gn` files no longer set them.
3. **Lambda generates only `headless_shell`'s graph.** The full Chrome graph no
   longer evaluates with printing disabled (new production code in
   `//chrome/browser/ui/browser_web_contents_delegate` depends on
   `//components/printing/browser`, and `//printing` asserts
   `enable_printing`). `lambda-arm64/build-chromium.sh` appends
   `root = "//headless:headless_shell"` and
   `root_patterns = [ "//headless:headless_shell" ]` to `.gn`, which replaces
   the 149 assert patcher and printing stubs. It has to be `.gn` rather than
   `gn gen --root-target/--root-pattern`: the `LICENSE.headless_shell` action
   runs its own `gn desc`, which only sees the dotfile.
4. **`libEGL.so` / `libGLESv2.so` can be zero-byte placeholders.** All Linux
   scripts skip `strip` for empty files.
5. **ARM64 LLVM bootstrap.** 157 reformatted `tools/clang/scripts/build.py`
   (`bootstrap_args = (...)` spans several lines), so the old PIC/libxml2
   injection silently no-oped. The matcher now accepts both layouts and fails
   loudly if an injection point is missing. `build.py` also parses `...Z`
   timestamps with `datetime.fromisoformat`, which needs Python 3.11, so the
   Lambda recipe switches to vpython's Python 3.11 before the LLVM step (Step
   5.5) like the other recipes. LLVM is `llvmorg-24-init-7747-g62397f8b`;
   CMake 3.20+ is still sufficient.
6. **Rust must match Chromium's toolchain exactly.** Blink now depends on C++
   headers that Crubit's `cc_bindings_from_rs` generates from Rust crates
   (`//third_party/blink/renderer/platform:font_rust_headers`). That tool is a
   rustc driver and rejects crates compiled by any other rustc
   (`error[E0514]: found crate core compiled by an incompatible version of
rustc`), so replacing `third_party/rust-toolchain/bin/rustc` with a rustup
   nightly, as the 149 recipes did, no longer works.
   - **x64** builds keep Chromium's bundled Rust toolchain untouched.
   - **ARM64** builds can't run that x86_64 toolchain. They install
     rust-lang/rust CI builds of the exact commit Chromium's toolchain is built
     from (`1edd55dcfcd573872c727fa3e086369a71661ee0`: `rustc`, `rust-std`,
     `rustc-dev`, `cargo`, `rustfmt` from `ci-artifacts.rust-lang.org`),
     build `cc_bindings_from_rs` against them with Chromium's
     `tools/rust/build_crubit.py`, and point `third_party/rust-toolchain` at
     them. Rust CI keeps these artifacts for about 168 days.
7. **More x86_64-only host tools on ARM64.** DevTools now uses the native
   TypeScript 7 compiler from `third_party/typescript/linux-amd64`; ARM64
   builds install the same npm release for arm64
   (`@typescript/typescript-linux-arm64`, integrity-checked) in its place.
   Crubit formats its output with `buildtools/linux64-format/clang-format`,
   which ARM64 builds replace with the `clang-format` from their LLVM build.
   Node stays at v24.12.0.
8. **macOS.** The deployment target is 13.0 (Chromium 157's default),
   `headless_use_policy` is gone, and `apply-clt-support.py` targets 157's
   reformatted `sdk_info.py`/`find_sdk.py`, which now always symlink the SDK
   when `use_system_xcode = true`. ANGLE's Metal shader condition is now a
   multi-line expression and is matched structurally.
9. **Resumable builds.** Every `setup-ec2.sh` starts the container with
   `sleep infinity` and runs `build-chromium.sh` through `docker exec`. When a
   step fails, the container (with its ~50 GB checkout) keeps running, so the
   remaining steps can be re-run with `docker exec` instead of restarting or
   `docker commit`-ing the container.

## What changed going from Chromium 144 → 149

Most of the pain in this bump came from new `gn gen` strictness, Chromium's
custom rustc moving to a newer date, and the build graph now touching modules
(`bindgen`, `log_severity_bindgen_generator`) that require extra host tooling.
Each variant README has the full blow-by-blow; highlights below.

### 1. `gn gen` now asserts on force-disabled subsystems

Chromium 149 added unconditional references to optional subsystems in
`chrome/...` `BUILD.gn` files. `gn gen` parses the entire build graph even for
`headless_shell`, so force-disabling these with `enable_*=false` in `args.gn`
now triggers assertion failures. **Drop these flags and rely on Chromium's
defaults**:

- `enable_extensions`
- `enable_platform_apps`
- `enable_compose`
- `enable_glic`
- `enable_mdns`
- `enable_service_discovery`
- `enable_click_to_call`
- `enable_bound_session_credentials`
- `enable_device_bound_sessions`

Unused code still isn't linked into `headless_shell`; it's only the graph that
needs to be consistent.

### 2. `use_system_minigbm = false`

Without this, `gn gen` fails trying to find the system `gbm` library.

### 3. PDF is now required and supported

All four `args.gn` now set:

```gn
enable_pdf = true
enable_printing = true
enable_print_preview = true
```

### 4. Node.js v24.12.0 (was v24.11.1)

`third_party/node/update_node_binaries` declares the version; read it and
download the arm64/x64 tarball directly rather than trusting the default helper
(which on ARM64 pulls the x64 binary and symlinks it the wrong way).

### 5. Rust nightly must match the bundled rustc commit

Chromium 149 bundles a patched rustc pinned to a specific upstream commit.
Using the wrong date breaks `format_placeholder`/`format_count` lang items or
`-Z` flag support. Derive the date dynamically from
`third_party/rust-toolchain/VERSION`:

```bash
RUST_COMMIT=$(cat third_party/rust-toolchain/VERSION | awk '{print $3}')
COMMIT_DATE_ISO=$(curl -s https://api.github.com/repos/rust-lang/rust/commits/$RUST_COMMIT | jq -r .commit.committer.date)
RUST_NIGHTLY_DATE=$(date -u -d "$COMMIT_DATE_ISO +1 day" +%Y-%m-%d)
rustup toolchain install "nightly-$RUST_NIGHTLY_DATE" \
  --profile minimal --component rustfmt --component rust-src
```

For 149.0.7790.0 this resolves to `nightly-2026-02-28`.

### 6. Python 3.11 required for `autoninja.py`

`depot_tools/autoninja.py` now `from enum import StrEnum`, which only exists in
Python ≥ 3.11. Ubuntu 22.04 ships 3.10 and AL2023 ships 3.9. Reuse the Python
3.11 that `vpython` downloads during `gclient sync`:

```bash
PY311=$(ls -d /root/.cache/vpython-root.0/store/cpython+*/contents/bin/python3.11 | head -1)
ln -sf "$PY311" /usr/local/bin/python3
ln -sf "$PY311" /usr/local/bin/python

mkdir -p /root/depot_tools/.cipd_bin
ln -sf "$PY311" /root/depot_tools/.cipd_bin/python3
echo ".cipd_bin" > /root/depot_tools/python3_bin_reldir.txt
```

Without the last three lines `autoninja` still dies with
`python3_bin_reldir.txt not found`.

### 7. `/usr/bin/python` symlink for Ninja

Ninja's own `configure.py` (built from source during setup) hard-codes
`#!/usr/bin/env python`, which doesn't exist on Ubuntu 22.04. Add
`ln -sf /usr/bin/python3 /usr/bin/python` before the Ninja build step.

### 8. `bindgen`, `rustfmt`, and the rust-toolchain/bin shims

Chromium 149 generates Rust bindings with `bindgen` and `rustfmt` at
`third_party/rust-toolchain/bin/`. Neither is bundled with `rustup` nightly.
Install them and symlink every host tool Chromium looks up:

```bash
cargo install bindgen-cli
TC=$(dirname "$(dirname "$(rustup which rustc)")")
for bin in rustc cargo rustfmt rustdoc clippy-driver cargo-clippy cargo-fmt; do
  [ -f "$TC/bin/$bin" ] && ln -sf "$TC/bin/$bin" third_party/rust-toolchain/bin/$bin
done
ln -sf "$(which bindgen)" third_party/rust-toolchain/bin/bindgen
cp -P "$TC"/lib/*.so*       third_party/rust-toolchain/lib/ || true
cp -rP "$TC"/lib/rustlib/*  third_party/rust-toolchain/lib/rustlib/
```

### 9. ARM64-only: `gperf` CIPD package and `mesa-common-dev`

The `infra/3pp/tools/gperf/linux-arm64` CIPD package does not exist. Patch
`DEPS` to restrict the `src/third_party/gperf/cipd` entry to `host_cpu == "x64"`,
then install `gperf` via `apt`/`dnf` and symlink the binary into the expected
location:

```bash
mkdir -p third_party/gperf/cipd/bin
ln -sf "$(command -v gperf)" third_party/gperf/cipd/bin/gperf
```

Ubuntu's `mesa-common-dev` is also needed: `gn gen` calls `pkg-config dri` for
`//build/config/linux/dri`, which is pulled in transitively from
`//content/gpu`.

### 10. ARM64-only: LLVM bootstrap PIC patches

Same story as 144: bootstrap must be PIC=OFF (static libs), final stage PIC=ON
(shared `libclang.so`). The patch patterns in `tools/clang/scripts/build.py`
changed in 149 — the matcher now needs to target:

```python
marker = "bootstrap_args = base_cmake_args + compiler_wrapper_cmake_args + [\n"
```

and inject `-DLLVM_ENABLE_PIC=OFF` and `-DLLVM_ENABLE_LIBXML2=OFF` at the top
of that list. Non-aarch64 runtime triples
(`i386`, `x86_64`, `armv7`, `riscv64`) must also be stripped from
`runtimes_triples_args`. A partial link failure of `libclang-cpp.so` is
tolerable — only `libclang.so` is needed for bindgen/Rust.

### 11. Clone from `chromium.googlesource.com`, not GitHub

Shallow clones of specific tags from `github.com/chromium/chromium` are
unusably slow (~1 h). Use:

```bash
git clone --depth 1 --branch 149.0.7790.0 \
  https://chromium.googlesource.com/chromium/src.git src
```

### 12. Disk space for Docker commits

200 GB gp3 is only just enough; committing the container image after LLVM
on linux-arm64 can ENOSPC and lose the container. Prefer `docker exec -d` to
re-enter a running container over `docker commit` during long builds.

## Common args.gn (all platforms)

```gn
import("//build/args/headless.gn")

is_official_build   = true
is_debug            = false
symbol_level        = 0
blink_symbol_level  = 0
v8_symbol_level     = 0

proprietary_codecs        = true
ffmpeg_branding           = "Chrome"
headless_use_embedded_resources = true
icu_use_data_file         = false

enable_pdf           = true
enable_printing      = true
enable_print_preview = true

use_sysroot         = false
use_dawn            = false
skia_use_dawn       = false
use_system_minigbm  = false
use_qt              = false
use_cups            = false
use_pulseaudio      = false

clang_use_chrome_plugins = false

enable_keystone_registration_framework = false
enable_linux_installer   = false
enable_media_remoting    = false
enable_swiftshader_vulkan = false
use_on_device_model_service = false

chrome_pgo_phase = 0
```

Platform-specific additions:

- **ARM64**: `target_cpu = "arm64"`, `v8_target_cpu = "arm64"`
- **x64**: `target_cpu = "x64"`, `v8_target_cpu = "x64"`
- **Lambda ARM64**: `enable_pdf`, `enable_printing`, `enable_print_preview`,
  `enable_platform_apps`, `enable_lens_desktop`, `enable_screen_ai_service`
  and `enable_library_cdms` are all `false`, which is why that build sets
  `root`/`root_patterns` in `.gn` to generate only `headless_shell`'s graph.
  It also sets `optimize_for_size = true`.

## Troubleshooting

See each variant's `README.md` for detailed postmortems; `lambda-arm64/README.md`
is the most detailed since it was the reference implementation.

Quick-reference table:

| Symptom                                                                            | Cause                                                           | Fix                                                                                                                      |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `gn gen` asserts on `enable_extensions=false` etc.                                 | v149 build graph is stricter                                    | Remove flag, rely on defaults                                                                                            |
| `Package dri was not found in the pkg-config search path`                          | Ubuntu missing `dri.pc`                                         | `apt install mesa-common-dev`                                                                                            |
| `python3_bin_reldir.txt not found`                                                 | depot_tools Python path                                         | Write `.cipd_bin` + symlink python3                                                                                      |
| `cannot import name 'StrEnum' from 'enum'`                                         | Python < 3.11                                                   | Symlink vpython's 3.11 over `/usr/local/bin/python3`                                                                     |
| `"third_party/rust-toolchain/bin/bindgen" missing`                                 | bindgen not installed                                           | `cargo install bindgen-cli` + symlink                                                                                    |
| `"third_party/rust-toolchain/bin/rustfmt" missing`                                 | rustup nightly without rustfmt                                  | `rustup ... --component rustfmt`                                                                                         |
| `unknown lang item: format_placeholder`                                            | Wrong Rust nightly                                              | Derive date from `rust-toolchain/VERSION`                                                                                |
| `recompile with -fPIC` during LLVM                                                 | Bootstrap PIC=OFF flag not applied                              | Patch `build.py` with the 149 marker                                                                                     |
| `no such package: infra/3pp/tools/gperf/linux-arm64`                               | ARM64 CIPD gperf missing                                        | DEPS patch + system gperf symlink                                                                                        |
| `/usr/bin/env: 'python': No such file or directory`                                | Ninja's `configure.py`                                          | `ln -sf /usr/bin/python3 /usr/bin/python`                                                                                |
| `No space left on device` during `docker commit`                                   | 200 GB filled                                                   | Skip intermediate commits; use `docker exec -d`                                                                          |
| `Cannot depend on platform apps because enable_platform_apps=false`                | v157 `//chrome/test` references `//apps`                        | Remove `enable_platform_apps = false`                                                                                    |
| `Lens backend logic is not supported on regular Mobile Android`                    | v157 asserts `enable_lens_overlay_backend`                      | Remove `enable_lens_desktop = false`                                                                                     |
| `assert(enable_printing)` in `//printing/BUILD.gn` (Lambda)                        | v157 browser code needs printing                                | `root`/`root_patterns` = `//headless:headless_shell` in `.gn`                                                            |
| `strip: ... file format not recognized` on `libEGL.so`                             | Zero-byte placeholder library                                   | Only strip non-empty files (`[ -s "$bin" ]`)                                                                             |
| `build.py: bootstrap_args list not found` (ARM64)                                  | LLVM `build.py` layout changed again                            | Update the matcher in Step 10                                                                                            |
| `error[E0514]: found crate core compiled by an incompatible version of rustc`      | rustc differs from the one `cc_bindings_from_rs` was built with | x64: keep the bundled toolchain; ARM64: exact-commit CI rustc + `build_crubit.py`                                        |
| `Exec format error: .../typescript/linux-amd64/src/lib/tsc` (ARM64)                | x86_64-only TypeScript compiler                                 | Install `@typescript/typescript-linux-arm64` of the same version                                                         |
| `ValueError: Invalid isoformat string: '...Z'` in LLVM `build.py`                  | Python < 3.11                                                   | Switch to vpython's 3.11 before Step 10                                                                                  |
| `rustc: error while loading shared libraries: libLLVM.so...` while building Crubit | rustc-dev's `librustc_driver` copy can't find `libLLVM`         | Symlink `libLLVM*.so*` into `lib/rustlib/<host>/lib`                                                                     |
| `curl 28 Operation too slow` cloning Chromium in Step 2 (Lambda)                   | googlesource takes over a minute to prepare the depth-1 pack    | `http.lowSpeedTime 600` instead of 60                                                                                    |
| Renderer crashes with "Chrome binary not found" after download                     | Zip layout doesn't match `BrowserFetcher`                       | See [Output zip layout requirements](#output-zip-layout-requirements) — wrapping folder + binary name must match exactly |

## Historical cost estimate

These estimates were recorded with the source build instructions; check current AWS pricing before launching a host.

| Platform                                         | Hourly (on-demand, eu-central-1) | Wall time   | Cost                         |
| ------------------------------------------------ | -------------------------------- | ----------- | ---------------------------- |
| [`lambda-arm64`](lambda-arm64/README.md)         | c7g.8xlarge ~$1.09/h             | ~2 h 35 min | ~$2.80                       |
| [`linux-arm64`](linux-arm64/README.md)           | c7g.8xlarge ~$1.09/h             | ~2 h 30 min | ~$2.75                       |
| [`linux-x64`](linux-x64/README.md)               | c6i.8xlarge ~$1.36/h             | ~1 h 20 min | ~$1.85                       |
| [`amazon-linux-x64`](amazon-linux-x64/README.md) | c6i.8xlarge ~$1.36/h             | ~1 h 20 min | ~$1.85                       |
| [`mac-arm64`](mac-arm64/README.md)               | mac-m4.metal Dedicated Host      | ~2 h 5 min  | 24 h minimum host allocation |

The Linux wall times are for a clean run of the 157 recipes (the LLVM step on
ARM64 takes 15–30 minutes of that, depending on how fast the llvm-project
clone is).

## Version

- **Chromium**: 157.0.8080.0 (commit `ab28d45abdcf95062bcb97d82e8a01b662d7cbdf`)
- **Node.js**: v24.12.0
- **Rust**: Chromium's bundled toolchain (x64) / rust-lang/rust CI build of
  `1edd55dcfcd573872c727fa3e086369a71661ee0` (ARM64)
- **LLVM**: `llvmorg-24-init-7747-g62397f8b`
- **Linux build date**: October 2026
- **macOS ARM64 build date**: October 2026

## License

The [Remotion License](../../LICENSE.md) applies.

Competing frameworks may not use our compiled binaries.
