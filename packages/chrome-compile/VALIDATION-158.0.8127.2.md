# Chrome 158.0.8127.2 validation

Tested October 30, 2026, from [PR #12814](https://github.com/remotion-dev/remotion/pull/12814), commit `68155cf6880092f2ce985622efac766037e57685`, Remotion 4.0.539. Use the [upgrade checklist](UPGRADE-CHECKLIST.md) for the required release gates.

This is a validation record, not approval to roll out. Local evidence, scripts, logs, frame hashes, and videos are in `out/chrome-158-validation/`. Those files are ignored by Git; preserve them with the PR before removing the worktree.

The supported Linux minimum is glibc 2.35. Amazon Linux 2023 on ARM64 is supported with glibc 2.34; unmodified Amazon Linux 2023 on x64 is unsupported. The earlier x64 results below are retained as compatibility diagnostics. The render-test recipe has since been migrated to `Dockerfile.al2023-arm64` and is run explicitly with `--platform=linux/arm64`.

## Confirmed results

| Check                     | Observed result                                                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Local workspace build     | All 62 selected package builds succeeded after installing the PR's locked dependencies.                                                                                                                      |
| Renderer tests            | 12 existing download-selection/shared-memory tests passed.                                                                                                                                                   |
| Published custom archives | All six downloaded; SHA-256, size, ZIP CRC, single top-level directory, and executable presence verified.                                                                                                    |
| macOS ARM64 installer     | Normal renderer download selected the custom Chrome 158 build; macOS signature verification passed.                                                                                                          |
| Native browser testbed    | Full 3,600-frame / 120-second video with AAC audio rendered. Inspected the GPU, H.264/H.265, and WebGL sections; ffprobe confirmed frame count and duration.                                                 |
| Native Chrome-for-Testing | Full 3,600-frame / 120-second testbed rendered with the same-version Google browser. Logs confirm ordinary screenshot fallback when the private shared-memory method is absent.                              |
| HTML-in-canvas render     | All 120 frames rendered on macOS with shared-memory capture. Inspected frame 60.                                                                                                                             |
| Shared-memory protocol    | Native macOS probe passed automatic POSIX and forced file pools, captured bytes, release/destruction, and cleanup.                                                                                           |
| Shared-memory video       | Remotion/FFmpeg renders passed through POSIX, forced-file, and disabled/shared-memory fallback modes. A static 30-frame font segment at CRF 1 had identical decoded hashes across POSIX and PNG fallback.    |
| Linux without `/dev/shm`  | Ubuntu 24 ARM64, `--ipc=none`: probe passed with both automatic and forced backends reporting `file`.                                                                                                        |
| Stock availability        | Both `chrome` and `chrome-headless-shell` returned HTTP 200 for all five platforms at 158.0.8127.2; all ten URLs match Google's manifest.                                                                    |
| Linux stock runtime       | Chrome-for-Testing installed and ran successfully in Ubuntu 24 ARM64 and x64; WebGL, WebGL2, actual H.264/AAC decoding, and canvas pixel probes passed except the known context-loss crash.                  |
| Proprietary codecs        | Real H.264 pixels and AAC samples decoded on macOS ARM64 and Linux ARM64/x64 in custom Headless Shell and stock Chrome-for-Testing. HTML video, AudioContext, VideoDecoder, and AudioDecoder were exercised. |
| WebGL/WebGL2              | Separate color-clear/readback probes passed at DPR 1 and 2. macOS tested SwiftShader and Metal; Linux ARM64 and x64 tested SwiftShader.                                                                      |
| Canvas object-fit / DPR   | Nested canvas `contain` and `cover` pixel checks passed at DPR 1 and 2 on the tested custom and stock browsers.                                                                                              |
| Canvas opacity            | Repeated opacity smoke passes on the tested platforms. The exact #12369 nested-canvas reproducer additionally passes custom and stock macOS Chrome 158 and crashes Chrome 157; see the follow-up below.      |
| MasterWithEffect          | The unchanged #12369 composition renders frames 181–1799 on Chrome 158; Chrome 157 reproduces the GPU crash at 275. Today's complete 1,608-frame composition also renders successfully.                      |
| Real Lambda               | Apple-emoji function deployed and rendered all four browser-test sections, HTML-in-canvas, and diagnostics; 14 output videos / 641 frames verified. See the Lambda matrix below.                             |

The animated Three.js comparison was not bit-identical: decoded SSIM was 0.982045 for POSIX versus PNG fallback and 0.993908 for POSIX versus file-backed capture. Do not use that animated scene as a byte-equality oracle; the static comparison above passed. No baseline performance comparison with Chrome 157 was completed.

Both upstream V8 regressions (`regress-567574900.js` and `regress-567576220.js`) passed twice in fresh contexts, with and without `--no-lazy-feedback-allocation`: 8/8 cases for the custom macOS browser and 8/8 for the stock browser. The tests came from the pinned V8 revision `50e276f4` and checked actual return values.

Linux ARM64 and x64 Chrome-for-Testing also completed 30-frame Remotion renders of the WebGL/WebGL2 section with ordinary screenshot fallback, beyond the direct browser probes.

Actual WebCodecs encode/decode round trips passed for H.264, VP8, VP9, and Opus in all six tested browser/platform combinations: custom and stock on macOS ARM64, Linux ARM64, and Linux x64. Each video case verified 12 decoded frames, red/green pixels, dimensions, and timestamps. Audio cases verified decoded samples, finite signal amplitude, and increasing timestamps. AAC encoding also passed in both macOS browsers; both Linux browsers on both architectures reported AAC encoding unsupported. AAC decoding passed on all of them. These are short software-preferred round trips, not a full client-side render or hardware-encoder matrix.

## Docker results

Each successful section covers 30 frames at concurrency 1. The four `browser-test` sections are fonts, GPU, codecs, and WebGL/WebGL2; HTML-in-canvas is a separate fifth render.

| Recipe            | ARM64                         | x64                                                                                                            |
| ----------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Ubuntu 22         | All five sections passed      | All five sections passed                                                                                       |
| Ubuntu 24         | All five sections passed      | All five sections passed                                                                                       |
| Debian Bookworm   | All five sections passed      | All five sections passed after retrying a package-download connection failure                                  |
| Amazon Linux 2023 | All five sections passed      | Fonts, GPU, WebGL/WebGL2, and HTML-in-canvas passed; media section failed at the compositor's GLIBC dependency |
| Nix               | Setup failed before rendering | Not run after the setup failure                                                                                |

The x64 runs were emulated on an ARM64 Docker host. Image inspection and launching each downloaded browser independently confirmed all eight image architectures and Chrome 158.0.8127.2. An earlier legacy-builder attempt reused ARM base images; those attempts were discarded and the x64 runs above explicitly used BuildKit.

All 39 exported Docker videos decoded to exactly 30 frames and one second. Representative Amazon Linux ARM64 GPU and Ubuntu 24 x64 codec frames were visually inspected. These bounded runs do not replace full-duration or native x64 validation.

### GLIBC policy follow-up

The renderer now requires glibc 2.35, with an exception for Amazon Linux 2023 ARM64 at 2.34. Runtime checks in real containers confirmed that Amazon Linux ARM64 starts without a warning, Amazon Linux x64 warns about the 2.35 minimum, and Ubuntu 22.04 starts without a warning on both architectures. Replacing `/etc/os-release` with a generic Linux fixture in the ARM64 container produces the 2.35 warning, confirming that the exception is specific to Amazon Linux 2023.

The migrated `Dockerfile.al2023-arm64` passed a fresh bounded smoke build with the updated local renderer: 60 frames each of fonts, GPU, codecs, WebGL/WebGL2, and HTML-in-canvas. All five exported videos decoded successfully to 60 frames and two seconds, totaling 300 frames. The installed renderer starts without a warning on glibc 2.34. Building the recipe for `linux/amd64` fails at its architecture guard with instructions to use `--platform=linux/arm64`. Evidence is in `out/chrome-158-validation/glibc-policy/`.

## Failures and incomplete gates

- The exact standalone WebGL-context-loss reproducer from [#12293](https://github.com/remotion-dev/remotion/issues/12293) still crashes the page after HTML-in-canvas paint. Reproduced on macOS with both SwiftShader and Metal, and on Linux ARM64/x64. Google's same-version Chrome-for-Testing also crashes. Keep [Chromium 575053149](https://issues.chromium.org/issues/575053149) open in the release decision.
- `bunx remotion gpu` fails to navigate to `chrome://gpu` in the custom macOS headless shell (`net::ERR_FAILED`). Actual WebGL rendering passes. This was not compared against the previous binary, so it is not classified as a new regression.
- `bunx remotion browser ensure --chrome-mode=chrome-for-testing` currently ignores the mode and ensures Headless Shell. The actual Chrome-for-Testing checks used a render with that flag or `ensureBrowser({chromeMode: 'chrome-for-testing'})`, then verified the executable/version.
- The initial Docker run hit stale Ubuntu package indexes (HTTP 404 during apt install). The Ubuntu 22/24 and Debian recipes now update package indexes in the same layer as installation.
- Docker Desktop stopped during the subsequent full emulated Ubuntu 24 run, before a final result. The completed Docker smoke matrix uses the same recipes with only render commands shortened to 30 frames from each of the four testbed sections, plus 30 HTML-in-canvas frames, at concurrency 1. It is not a full-duration Docker pass.
- Nix fails before rendering: `nixpkgs.nodejs-18_x` no longer exists. Its existing recipe uses system Chromium rather than the candidate binary and cannot establish candidate compatibility even if that setup failure is fixed.
- Amazon Linux 2023 x64 is unsupported: when H.265 falls back to `@remotion/compositor-linux-x64-gnu`, the executable requires `GLIBC_2.35`, which is unavailable in that image. Chrome launches, shared-memory capture works, and the other four sections pass. The follow-up investigation below reproduces this compositor incompatibility starting with stable Remotion 4.0.0; this Chrome PR does not change the compositor binary. This diagnostic is excluded from the supported Docker release gates.
- Native Windows and macOS Intel were not rerun in this session. Windows shared-memory capture is unsupported by the current POSIX-only patch and Windows FFmpeg. Windows needs a native screenshot-fallback gate; the PR's earlier reported Windows verification is separate evidence.
- NVIDIA/ANGLE EGL, WebGPU effects, hardware codecs, and a complete client-side render remain unverified in this session. Native interactive Studio playback for #12369 was blocked by the Mac lock screen; the rendering and headless real-time Player checks below completed independently.

## Issue #12369 composition regression re-test

The reported crashes no longer reproduce in these Chrome **158.0.8127.2** checks. Tested on macOS **15.7.9 / Apple Silicon**, with `--gl=angle`. The issue originally used macOS 26.1; the Chrome 157 control still reproduces its original crash on this machine.

Created a clean checkout of the issue's exact revision, [`2527735f88046fba5f175422ca9bbbc517b6b071`](https://github.com/remotion-dev/remotion/commit/2527735f88046fba5f175422ca9bbbc517b6b071), installed its locked dependencies, and built its packages. Tracked source remained unchanged: the zero-scale endpoints, nested canvas implementation, and original composition timing were preserved. This avoids attributing later Remotion workarounds or composition edits to a browser fix.

| Check                                                                                                 | Chrome 157.0.8080.0                                                                                                            | Chrome 158.0.8127.2                                                                                                      |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Original `MasterWithEffect`, JPEG sequence, concurrency 1, frames 181–290                             | Fails at frame 275 with `Transform.cpp:279: check(this->valid())`, followed by loss of the WebGL2 effect context               | All 110 frames render                                                                                                    |
| Original composition, continuous frames 181–1799                                                      | First transition already fails in the control above                                                                            | All 1,619 frames render, including 275, 534–537, and the ending; no native crash signatures                              |
| Current PR composition, continuous frames 0–1607                                                      | Not rerun; the composition has changed since the issue                                                                         | All 1,608 frames render; no native crash signatures                                                                      |
| Exact nested drawable-canvas opacity reproducer from the issue comment                                | Page crashes with `paint_artifact_compositor.cc:1311: !effect.IsInDrawableCanvasSubtree()`; removing the opacity change passes | Passes in both custom Headless Shell and Google's Chrome-for-Testing; actual red canvas pixels and opacity zero verified |
| Original composition in a real-time Player, starting at frame 210 with `defaultPremountInSeconds={2}` | Native GPU/page crash after the last sampled frame 265, with the same Skia assertion                                           | Chrome-for-Testing reaches frame 1799 and emits `ended`, without errors or crashes                                       |

The playback harness uses the historical `Player`, original composition, automatic playback, and two-second premounting in a headless browser. Both pixel densities 1 and 2 pass on Chrome-for-Testing 158; Chrome 157 crashes in both controls. It records frame events and checks that playback progressed past the former failure points and reached the last frame before `ended`. This exercises real-time preview behavior, but is not a completed native Studio UI test: the Mac was locked when that check was attempted.

Both completed render sequences were decoded with FFmpeg, and images at the former failure transitions were visually inspected. The original source still contains the exact zero scales, so these results are not explained by applying the issue's suggested workarounds.

[Chromium issue 575053148](https://issues.chromium.org/issues/575053148) is marked fixed and links [the nested-canvas compositor fix](https://chromium-review.googlesource.com/8613587). Its standalone reproduction now passes, and the larger original composition also passes the checks above. The separate forced WebGL-context-loss crash, [575053149](https://issues.chromium.org/issues/575053149), still reproduces as recorded earlier and is not covered by that conclusion.

Logs, the exact standalone HTML, playback harness, frame hashes, and representative images are retained under `out/chrome-158-validation/issue-12369/`. The full historical sequence is in `/private/tmp/remotion-12369-validation/packages/jonnys-videos/out/issue-12369/`; the current sequence is in the local evidence directory.

## Amazon Linux x64 compositor compatibility history

The first affected stable release is **Remotion 4.0.0, published July 3, 2023**. This predates the Chrome 158 upgrade. The Amazon Linux 2023 x64 image used here has GLIBC 2.34; the compositor requires `hypot@GLIBC_2.35` from `libm.so.6`.

Downloaded these packages from the official npm registry, verified their published integrity hashes, inspected ELF dynamic symbols, and tested them in the same Amazon Linux x64 container under emulation:

| Published package | Date             | Compositor's highest GLIBC import | Startup on Amazon Linux 2023                                          |
| ----------------- | ---------------- | --------------------------------- | --------------------------------------------------------------------- |
| 3.3.103           | July 2, 2023     | 2.12                              | Starts and reaches its JSON parser; no full historical render claimed |
| 4.0.0             | July 3, 2023     | 2.35                              | Fails on `hypot@GLIBC_2.35`                                           |
| 4.0.94            | January 23, 2024 | 2.35                              | Same failure                                                          |
| 4.0.539           | October 26, 2026 | 2.35                              | Same failure                                                          |

The source change is [video rotation support, June 30, 2023](https://github.com/remotion-dev/remotion/commit/f0bdc8f1f04d924cc8269130101550d386b1f052), which added two `f64::hypot()` calls. They remain in [`rotation.rs`](../compositor/rust/rotation.rs). The [4.0.0 release commit](https://github.com/remotion-dev/remotion/commit/67a5b7553ababd7a6310eb8022673aca208121c6) first ships the x64 binary importing `hypot@GLIBC_2.35`; its immediate parent's binary has no `hypot` import and tops out at GLIBC 2.34. The older published 3.3.103 binary differs from that pre-release tree and has a lower requirement. A scan of 254 tracked binary revisions found no subsequent reduction of the 2.35 requirement.

The loader rejects the executable before it can inspect a video's rotation. The testbed exposes it when H.265 decoding falls back to `<OffthreadVideo>` and starts the compositor. Successful Chrome rendering or invoking the separate FFmpeg encoder does not exercise this executable. The original Amazon Linux recipe was commented out in `run.sh`; it is now an explicit ARM64-only test.

The current ARM64 compositor imports `hypot@GLIBC_2.17` and its own highest GLIBC import is 2.25, so this x64 dependency does not affect the successful ARM64 Lambda runs. This is an architecture-specific binary compatibility constraint.

[Issue #2439](https://github.com/remotion-dev/remotion/issues/2439) records the historical GLIBC discussion. Its later comment about lowering the requirement to 2.31 does not match the published 4.0.94 compositor: that executable still requires 2.35. The bundled FFmpeg executables/libraries in 4.0.94 and 4.0.539 have their own GLIBC imports at or below 2.29; lowering their build baseline did not lower the Rust compositor's requirement.

Supporting unmodified Amazon Linux 2023 x64 would require rebuilding the compositor against a compatible GLIBC sysroot, then testing the executable and every bundled shared library on that distribution. It remains outside the supported policy. A browser-only rebuild cannot resolve this dependency. Raw history, symbol tables, npm metadata, and runtime results are retained under `out/chrome-158-validation/compositor-history/`.

## Lambda package and deployment

Published a new Chromium layer in the publishing account:

```text
arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-arm64:72
```

The staging object is `s3://remotionlambda-binaries-eu-central-1/chrome-validation/chromium-158.0.8127.2-68155cf688.zip`. The layer contains the verified Lambda ARM64 executable renamed to `bin/chromium`, its GL/Vulkan libraries, and bundled Amazon Linux libraries. Existing hosted references and other regions were not changed.

The local function ZIP plus the exact hosted fonts layer 71 and Apple emoji layer 33 totals 230,298,453 uncompressed bytes (219.63 MiB), leaving 31,845,547 bytes (30.37 MiB) below the 262,144,000-byte limit. Font layers were downloaded from AWS and measured by ZIP entry sizes. AWS accepted the actual Apple-emoji deployment. The v24 source archives' default Google-emoji+CJK combination totals 229.89 MiB; that default combination has not been deployed here.

Real Lambda validation used rendering account `216109788429`, with temporary access to the candidate layer. The isolated function was `remotion-render-4-0-539-mem6144mb-disk2048mb-180sec`, running Node.js 24 on ARM64 with 6,144 MiB memory, 2,048 MiB disk, and a 180-second timeout. `GetFunction` confirmed the three exact layer ARNs and an active function; its code SHA-256 matched the local runtime ZIP. A JSON artifact emitted by the browser reported `HeadlessChrome/158.0.8127.2`.

| Lambda case                                                                        | Frames          | Result                                 |
| ---------------------------------------------------------------------------------- | --------------- | -------------------------------------- |
| System fonts                                                                       | 30–89           | Passed                                 |
| GPU, PNG, one chunk                                                                | 900–1019        | Passed                                 |
| GPU, JPEG, `framesPerLambda: 30`, `concurrencyPerLambda: 2`                        | 900–1019        | Passed                                 |
| GPU, shared memory disabled                                                        | 900–1019        | Passed                                 |
| H.264/H.265 media section                                                          | 1800–1859       | Passed                                 |
| WebGL/WebGL2 testbed section                                                       | 2700–2759       | Passed                                 |
| HTML-in-canvas, `framesPerLambda: 30`                                              | 0–59            | Passed                                 |
| Apple emojis and browser diagnostics                                               | 0–29            | Passed; emoji frame visually inspected |
| Repeated static capture, disabled-capture comparison, and direct invocation probes | 1–2 frames each | Passed                                 |

The diagnostics separately verified WebGL and WebGL2 pixel readback `[51,102,204,255]`, the SwiftShader renderer, an actual H.264 red pixel `[254,0,0,255]`, and 46,080 decoded AAC samples with nonzero signal amplitude. An initial raw-H.264 diagnostic failed its pixel assertion because the fixture lacked color metadata. The same mismatch reproduced locally; adding the fixture's BT.601 metadata corrected it without relaxing the assertion. This was a fixture correction, not a Chrome regression.

AWS invocation log tails explicitly showed `Remotion shared-memory capture uses the file backend` and FFmpeg's `-f,remotionshm` plus `-pool_dir,/tmp/...`. The disabled path rendered successfully. At CRF 1, the repeated two-frame static samples had identical decoded hashes across automatic capture and screenshot fallback; a second direct-invocation pair also matched. The two groups used different encoder presets and were compared within their own settings. Sampled invocation tails reported 1,078 MB maximum memory used and browser reuse; this is not a sustained-load memory benchmark. Full CloudWatch history was unavailable under the rendering account's standard permissions, so the capture evidence was retrieved through invocation log tails.

All 14 downloaded Lambda videos decoded to the expected 641 total frames and durations. GPU and Apple-emoji output were visually inspected. The main testbed runs were bounded segments, not a full 3,600-frame Lambda render. Runtime scripts, the diagnostic artifact, logs, hashes, and videos remain in `out/chrome-158-validation/`.

After validation, the temporary function, both test sites, 15 render prefixes, and the temporary account-specific layer grant were removed. CloudWatch logs have one-day retention. The candidate layer and staging ZIP remain in the publishing account; the layer is private and no hosted reference was changed. Making it generally consumable and updating the test-region reference remain release steps.

## Reproduction commands

Build and focused tests from the repository root:

```sh
bun install --frozen-lockfile
bunx turbo run make --filter='@remotion/cli' --filter='@remotion/example' --filter='@remotion/lambda'
bun test packages/renderer/src/test/get-chrome-download-url.test.ts packages/renderer/src/test/remotion-shared-memory.test.ts
bun packages/chrome-compile/src/download.ts
```

Native renders from `packages/example`:

```sh
bunx remotion render src/browser-test-entry.ts browser-test out/browser-test.mp4 --concurrency=2 --log=verbose
bunx remotion render src/browser-test-entry.ts browser-test out/browser-test-cft.mp4 --concurrency=2 --chrome-mode=chrome-for-testing --log=verbose
bunx remotion render src/browser-test-entry.ts html-in-canvas out/html-in-canvas.mp4 --concurrency=2 --log=verbose
```

Probe the actual downloaded executable using `packages/chrome-compile/mac-arm64/probe-fast-path.py`. The additional standalone browser probes, source fixtures, per-platform Dockerfiles, and exact command logs are retained with the local evidence.
