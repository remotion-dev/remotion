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

| File                                       | Purpose                                                              |
| ------------------------------------------ | -------------------------------------------------------------------- |
| `launch-ec2.sh`                            | Provisions the EC2 instance (AMI lookup, key pair, security group)   |
| `setup-ec2.sh`                             | Runs on EC2: installs Docker, builds image, runs build, extracts zip |
| `Dockerfile`                               | Build container with all system dependencies                         |
| `build-chromium.sh`                        | Main build script (runs inside container)                            |
| `args.gn`                                  | Chromium GN build flags for headless ARM64                           |
| [`../shared/.gclient`](../shared/.gclient) | gclient config (copied as `dot-gclient` in Docker context)           |

## Quick start

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

## Chromium 157 build details

1. **`gn gen` only generates `headless_shell`'s graph.** The full Chrome graph
   no longer evaluates with printing disabled (for example
   `//chrome/browser/ui/browser_web_contents_delegate` depends on
   `//components/printing/browser`, and `//printing` asserts
   `enable_printing`). Step 15 appends `root = "//headless:headless_shell"` and
   `root_patterns = [ "//headless:headless_shell" ]` to `.gn`, so every gn
   invocation (including the `gn desc` run by the `LICENSE.headless_shell`
   action) uses that graph. This avoids patching unrelated GN targets or adding printing stubs.
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

## Output

The build script strips and packages the browser and its runtime libraries. See the [ZIP layout requirements](../README.md#output-zip-layout-requirements) for the required wrapping directory and executable name.
