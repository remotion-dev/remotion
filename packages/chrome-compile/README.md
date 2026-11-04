# @remotion/chrome-compile

Follow the [Chrome upgrade checklist](UPGRADE-CHECKLIST.md) before shipping a new browser version or rebuilt binary.

See the [Chrome 158.0.8127.2 validation record](VALIDATION-158.0.8127.2.md) for observed results and remaining gates.

Public build instructions and scripts imported from `remotion-dev/chrome-compile` at commit `6255f0237c39798faa0b803fa0bd17e842853487` (October 5, 2026). This is a private workspace package, so the source is public in the monorepo but the package is not published to npm.

## Use this package

From a Remotion checkout, run `bun install`, then `cd packages/chrome-compile`. Follow the platform guide below to compile Chromium. Builds and EC2 launches are explicit manual operations; normal dependency installation and monorepo builds do not compile Chromium, launch instances, or download binary archives.

The package contains the current build scripts, configuration, patches, probes, and documentation. Generated ZIPs are hosted on `remotion.media` and excluded from Git. `artifacts.json` records the SHA-256 and byte size of the six Chromium 158 archives.

```sh
# Show available archive paths without downloading anything.
bun run download --list

# Download the six current Chromium 158 archives.
bun run download

# Download a single archive.
bun run download output/chromium-headless-shell-linux64.zip
```

Existing matching files are verified and reused. Existing files with different contents are preserved, so move your own build output before restoring a recorded artifact.

These downloads verify checksums and preserve the original ZIP bytes; they do not upgrade the browser version used by Remotion. Publishing a new browser build still requires validating its layout and runtime behavior as described below.

Build Chromium **158.0.8127.2** `headless_shell` with proprietary codecs
(H.264/AAC) for the platforms used by Remotion. The generic Linux, Amazon
Linux x64 and Windows builds include PDF/printing support; the Lambda build
disables it and is compiled with `optimize_for_size = true` to stay small. All
six builds apply Remotion's v3 shared-memory capture patch
(`mac-arm64/remotion-shared-memory-v3.patch`, rebased onto 158). The patch
only implements its POSIX pool backends on macOS and Linux; the Windows build
compiles the patched protocol and reports the capability error that makes
Remotion fall back to ordinary screenshots (see [`win-x64`](win-x64/README.md)).
All production recipes build with `is_debug = false` and
`dcheck_always_on = false`. The generic Linux builds additionally enable
ANGLE's OpenGL backend (`angle_enable_gl = true`) so `--gl=angle-egl` can use a
native EGL driver.

## Shared-memory capture patch (v3)

The patch adds private CDP commands (`Page.remotionCreateFramePool`,
`Page.remotionReleaseFrame`, `Page.remotionDestroyFramePool`) and raw BGRA
capture parameters on `Page.captureScreenshot`. v3 adds a second pool backend
for hosts without POSIX shared memory:

| Backend     | Storage                                                                                                  | Selected when                                                                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `posix-shm` | `shm_open("/rmshm-<random>")`, `/dev/shm` on Linux                                                       | Default; tried first. On Linux the pages are reserved up front (`fallocate`, or zero-fill where that is not permitted, as on Lambda's `/tmp`) so a full tmpfs (e.g. a 64 MB container `/dev/shm`) fails cleanly instead of SIGBUS. |
| `file`      | Regular file `<backingDirectory>/rmshm-<random>` (mode 0600, `O_EXCL`, `O_NOFOLLOW`) mapped `MAP_SHARED` | `shm_open` fails (AWS Lambda has no `/dev/shm`) and the caller passed `backingDirectory`, or `preferredBackend: "file"`.                                                                                                           |

Each build runs the shared-memory probe before packaging (on Windows it verifies the capability error and ordinary PNG capture instead). For target-environment validation, follow the [Lambda smoke test](lambda-arm64/README.md#lambda-smoke-test) or the [macOS verification steps](mac-arm64/README.md#verify-before-publishing).

| Variant                                          | remotion.media object                                         |       Bytes | SHA-256                                                            |
| ------------------------------------------------ | ------------------------------------------------------------- | ----------: | ------------------------------------------------------------------ |
| [`linux-x64`](linux-x64/README.md)               | `chromium-headless-shell-linux-x64-158.0.8127.2.zip`          | 107,515,885 | `37efc23c796de6a7ae6360b545434863e1c35d9cabc7fddc8036e8c6e00697e8` |
| [`linux-arm64`](linux-arm64/README.md)           | `chromium-headless-shell-linux-arm64-158.0.8127.2.zip`        | 100,692,102 | `9d48943eb88a60d34d0c4213f59ceebc807b182fb28cbb4ee5283c047b81b26b` |
| [`amazon-linux-x64`](amazon-linux-x64/README.md) | `chromium-headless-shell-amazon-linux-x64-158.0.8127.2.zip`   | 109,296,701 | `6ddba099a234c3c584caee4e0d52f95838e2acd8d1186552c83dff1bd88fcddb` |
| [`lambda-arm64`](lambda-arm64/README.md)         | `chromium-headless-shell-amazon-linux-arm64-158.0.8127.2.zip` |  85,643,494 | `eaf6b3e0f4d7f1771656ab03fa30cefa854e15c98c4142be9b7c62111fab131c` |
| [`mac-arm64`](mac-arm64/README.md)               | `chromium-headless-shell-mac-arm64-158.0.8127.2.zip`          | 147,153,468 | `8b7c8d0c0a04a7d32ade612b51ac9ae1aa7d674d9eb0bb6f794eee253b835a04` |
| [`win-x64`](win-x64/README.md)                   | `chromium-headless-shell-win-x64-158.0.8127.2.zip`            | 137,435,497 | `58afb19b136b32c36a9b879cedde3d8a05d0f5cfb2e60b6f17b7c0301e10299a` |

Since 157, `libEGL`/`libGLESv2` are small shims and ANGLE is linked into the
browser binary. The 158 macOS archive is 32 MB smaller than the 157 one
(179.2 → 147.2 MB) although the version changed too; its executable no longer
contains the `Debug check failed` handler because DCHECKs are off. The previous
157 archives stay on `remotion.media` under their `157.0.8080.0` names.

The Lambda build is compiled with `optimize_for_size = true` (`-Os` for C/C++,
`-Copt-level=s` for Rust). This was measured on Chromium 157, where the `-O2`
build of the same commit is still available as
`chromium-headless-shell-amazon-linux-arm64-157.0.8080.0.zip`
(96,507,420 bytes, SHA-256 `0becf9784c02c4d5c27fc930104b7e269ac941f88baff2ff2829f201839e2bcc`).
Compared with it, the size-optimized 157 zip was 12.8 MB smaller (96.5 → 83.7 MB)
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

## Chromium build targets

Remotion rendering requires glibc 2.35 or later on Linux. Amazon Linux 2023 on ARM64 is supported with glibc 2.34. Unmodified Amazon Linux 2023 on x64 is unsupported. Its Chromium build below is retained for environments such as Vercel that separately patch the compositor; a working browser alone does not establish rendering support.

| Directory                                        | Target                                         | Instance     | Build time  | Output size | Output zip (script-emitted name)                     |
| ------------------------------------------------ | ---------------------------------------------- | ------------ | ----------- | ----------- | ---------------------------------------------------- |
| [`lambda-arm64`](lambda-arm64/README.md)         | AWS Lambda (Amazon Linux 2023, ARM64)          | c7g.8xlarge  | ~2 h 35 min | ~84 MB      | `chromium-headless-shell-amazon-linux2023-arm64.zip` |
| [`linux-arm64`](linux-arm64/README.md)           | Debian/Ubuntu ARM64 (glibc ≥ 2.35)             | c7g.8xlarge  | ~2 h 30 min | ~98 MB      | `chromium-headless-shell-linux-arm64.zip`            |
| [`linux-x64`](linux-x64/README.md)               | Debian/Ubuntu x86_64 (glibc ≥ 2.35)            | c6i.8xlarge  | ~1 h 20 min | ~104 MB     | `chromium-headless-shell-linux64.zip`                |
| [`amazon-linux-x64`](amazon-linux-x64/README.md) | AL2023 x86_64 browser for patched environments | c6i.8xlarge  | ~1 h 20 min | ~106 MB     | `chromium-headless-shell-amazon-linux2023-x64.zip`   |
| [`mac-arm64`](mac-arm64/README.md)               | macOS ARM64 (13.0+)                            | mac-m4.metal | ~2 h 5 min  | ~179 MB     | `chromium-headless-shell-mac-arm64.zip`              |
| [`win-x64`](win-x64/README.md)                   | Windows x64 (Windows 10+)                      | c6i.16xlarge | ~1 h 20 min | ~137 MB     | `chromium-headless-shell-win64.zip`                  |

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

| Variant                                          | Zip filename (in `output/`)                          | Wrapping folder inside zip                        | Binary name inside folder                              | Bundles system `.so`s?          |
| ------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------ | ------------------------------- |
| [`linux-x64`](linux-x64/README.md)               | `chromium-headless-shell-linux64.zip`                | `chrome-headless-shell-linux64/`                  | **`chrome-headless-shell`** (NOT `headless_shell`)     | no                              |
| [`linux-arm64`](linux-arm64/README.md)           | `chromium-headless-shell-linux-arm64.zip`            | `chrome-headless-shell-linux-arm64/`              | `headless_shell`                                       | no                              |
| [`amazon-linux-x64`](amazon-linux-x64/README.md) | `chromium-headless-shell-amazon-linux2023-x64.zip`   | `chromium-headless-shell-amazon-linux2023-x64/`   | `headless_shell`                                       | yes — AL2023 needs them bundled |
| [`lambda-arm64`](lambda-arm64/README.md)         | `chromium-headless-shell-amazon-linux2023-arm64.zip` | `chromium-headless-shell-amazon-linux2023-arm64/` | `headless_shell`                                       | yes — AL2023 needs them bundled |
| [`mac-arm64`](mac-arm64/README.md)               | `chromium-headless-shell-mac-arm64.zip`              | `chrome-headless-shell-mac-arm64/`                | `chrome-headless-shell`                                | no                              |
| [`win-x64`](win-x64/README.md)                   | `chromium-headless-shell-win64.zip`                  | `chrome-headless-shell-win64/`                    | `chrome-headless-shell.exe` (NOT `headless_shell.exe`) | no (static CRT)                 |

Packaging requirements:

- Rename the generic Linux x64 executable from `headless_shell` to `chrome-headless-shell` and the Windows executable from `headless_shell.exe` to `chrome-headless-shell.exe` when packaging them.
- Every archive must contain the wrapping directory shown above.
- Amazon Linux archives bundle the system libraries needed by AL2023 and Lambda. Generic Linux archives rely on the runtime dependencies listed in their platform guides.
- Build scripts emit the short ZIP names shown above. Publishing adds the platform and Chromium version to the hosted filename.

## Quick start

For Linux, use the platform-specific EC2 and Docker instructions below. For
macOS ARM64, follow [the native Mac build guide](mac-arm64/README.md), and for
Windows x64 [the Windows build guide](win-x64/README.md). The macOS and Windows
builds pin Chromium 158 by commit independently; they do not use
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

Each Linux build checks that the patch applies to Chromium 158, compiles the
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

## Build configuration

Each platform's `build-chromium.sh` (or `build-chromium.ps1` on Windows) and `args.gn` contain the current toolchain setup and build flags. The Linux `Dockerfile` files provide the system dependencies, and `shared/.gclient` configures their Chromium checkout. The macOS and Windows builds use their own native toolchain setup.

The Linux setup scripts leave the build container running after a failure so you can inspect its logs and state without creating a Docker image snapshot.

## Version

- **Chromium**: 158.0.8127.2 (commit `681cd621e82e606d7536eae8ea2576afb3c7d65c`)
- **Node.js**: v24.12.0
- **Rust**: Chromium's bundled toolchain (x64, Windows) / rust-lang/rust CI
  build of `8a9dd7abdf013ec10cfeaaa3685feba18ef1c90c` (ARM64)
- **LLVM**: `llvmorg-24-init-14453-ge063be79`
- **Linux build date**: October 2026
- **macOS ARM64 build date**: October 2026
- **Windows x64 build date**: October 2026

## License

The [Remotion License](../../LICENSE.md) applies.

Competing frameworks may not use our compiled binaries.
