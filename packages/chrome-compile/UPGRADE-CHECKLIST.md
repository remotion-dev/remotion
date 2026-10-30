# Chrome upgrade checklist

Complete this checklist for every Chromium upgrade or rebuild that changes patches, build flags, toolchain, or packaging. Keep a dated results file with the PR SHA, exact browser version, platform, commands, logs, rendered artifacts, and remaining failures. A successful download, build, or CI run does not establish runtime compatibility.

Mark each gate as passed, failed, or not run. An existing upstream failure needs an explicit release decision and a linked issue; it must not be recorded as passed. Do not roll out beyond the test region while required validation is missing.

## 1. Identify and verify the shipped binaries

- [ ] Pin the Chromium source commit, V8 revision, patches, GN arguments, and toolchain. Check `is_debug = false`, `dcheck_always_on = false`, proprietary codecs, and the intended ANGLE backends in the resolved build configuration.
- [ ] Verify the six Remotion archives: Linux x64/ARM64, Amazon Linux x64/ARM64, macOS ARM64, and Windows x64. The Amazon Linux x64 browser archive is used by environments such as Vercel with a separately patched compositor; unmodified Amazon Linux 2023 x64 is unsupported. Verify the stock macOS Intel download separately.
- [ ] Download the published artifacts, verify SHA-256, byte size, ZIP integrity, top-level directory, executable name/permissions, and runtime libraries against `BrowserFetcher`. Run macOS code-signature verification.
- [ ] Use a clean Remotion cache to exercise download, extraction, version markers, and launch. Upgrade an existing cache as well. Rebuilt binaries of the same Chrome version need a new cache marker. Check Windows filenames and paths with spaces.
- [ ] Run the packaged executable and record its actual version. Do not infer it from an archive filename, source constant, or layer description.
- [ ] Preserve the previous archives and layer ARNs for rollback.
- [ ] Rebuild composition bundles and redeploy Lambda sites, Docker images, and Vercel snapshots when a browser upgrade also needs a browser-side Remotion fix. Updating the renderer or Chrome binary alone does not update JavaScript in an existing site or snapshot.

## 2. GPU testbed on native platforms

- [ ] Run `packages/example/src/browser-test-entry.ts`, composition `browser-test`, on native macOS ARM64, Linux x64/ARM64, and Windows x64. Cover the stock macOS Intel path on native hardware.
- [ ] Verify WebGL and WebGL2 separately, including successful drawing/readback and the GPU vendor/renderer. A non-null context alone is insufficient.
- [ ] Exercise the default backend and SwiftShader. Verify Metal on macOS and ANGLE EGL on a Linux NVIDIA GPU when native GPU support is claimed. Emulation and SwiftShader cannot validate NVIDIA acceleration.
- [ ] Exercise WebGPU compositions/effects where supported. Compare capability and rendered output with the previous version.
- [ ] Check the GPU diagnostics command. Headless-shell builds may lack `chrome://gpu`; record a failure of `bunx remotion gpu` separately from successful WebGL rendering.

Run from `packages/example`:

```sh
bunx remotion render src/browser-test-entry.ts browser-test out/browser-test.mp4 --log=verbose
bunx remotion render src/browser-test-entry.ts html-in-canvas out/html-in-canvas.mp4 --log=verbose
```

The full `browser-test` is 3,600 frames at 30 FPS. A short render of its beginning only tests fonts:

| Frames    | Content                                            |
| --------- | -------------------------------------------------- |
| 0–899     | System fonts                                       |
| 900–1799  | Three.js GPU scene                                 |
| 1800–2699 | H.264/H.265 through the testbed's media components |
| 2700–3599 | Separate WebGL and WebGL2 availability checks      |

For a smoke run, render at least 60 consecutive frames from each section, plus `html-in-canvas`. Record that this is partial coverage. Keep a full run for sustained rendering and memory checks.

## 3. Docker matrix

- [ ] Build and render `Dockerfile.ubuntu22`, `Dockerfile.ubuntu24`, and `Dockerfile.debian` for both `linux/amd64` and `linux/arm64`. Verify which architecture actually ran; mark emulated runs.
- [ ] Run `Dockerfile.al2023-arm64` with `--platform=linux/arm64`. Amazon Linux 2023 ARM64 is the glibc 2.34 exception; x64 is unsupported and excluded from the render matrix.
- [ ] Attempt `Dockerfile.nix` and document its result separately. It currently uses a template and system Chromium, so it does not validate the candidate Remotion binary. It is also commented out in `run.sh`.
- [ ] Run `remotion compositions`, `browser-test`, and `html-in-canvas` in each supported image, using local workspace packages. Check actual browser versions and inspect output.
- [ ] Exercise containers with normal `/dev/shm`, Docker's small default `/dev/shm`, and no `/dev/shm`. Check fallback behavior and cleanup after failure.
- [ ] Check shared-library/glibc compatibility against the supported minimum: glibc 2.35, or glibc 2.34 on Amazon Linux 2023 ARM64. A stock-browser fallback does not lower the rendering requirement. A working Ubuntu 24 image does not establish Ubuntu 22, Debian, or Amazon Linux ARM64 compatibility.
- [ ] Check the compositor executable and bundled FFmpeg libraries independently of Chrome. Inspect their versioned GLIBC imports and exercise a media path that starts the compositor. Browser launch and FFmpeg encoding can pass while the compositor fails to load.

Run from `packages/dockerfiles` after building the local CLI:

```sh
bash run.sh
```

Keep `apt-get update` and the corresponding install in the same Docker layer so cached package indexes do not refer to deleted packages.

## 4. Real Lambda invocation and deployment size

- [ ] Use the publishing AWS account only for the hosted binary upload. Use the rendering account's credentials for functions, sites, renders, and logs. Verify account IDs without printing credentials.
- [ ] Publish the candidate to `eu-central-1` first. Record the returned layer ARN/version and its access policy. Use the exact candidate layer in a newly deployed test function; existing hosted layers and green Lambda CI can still exercise the old Chrome.
- [ ] Build the function ZIP from the PR. Sum ZIP entries' uncompressed sizes for the function and every selected layer; do not use compressed sizes or `du` as the deployment-size measurement.
- [ ] Deploy with Apple emojis and prove the combined package stays below 262,144,000 bytes (250 MiB). Record headroom. Check the default Google emoji + CJK combination too, and any supported optional layers/extensions. AWS counts function code, layers, and custom runtime together: [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html).
- [ ] Run every `browser-test` section and `html-in-canvas` on Lambda. Inspect fonts/emoji output, GPU content, and decoded video frames.
- [ ] Render with PNG and JPEG input settings, a single chunk and multiple chunks, and more than one frame concurrently. Verify final frame count, duration, audio, and chunk boundaries.
- [ ] Prove the file-backed shared-memory path is active in function logs: the file-backend message and FFmpeg `remotionshm`/`-pool_dir` arguments must appear. Use CloudWatch or AWS invocation `LogType: 'Tail'`; the standard rendering credentials do not include CloudWatch log-read permissions. A successful fallback render is not a shared-memory pass.
- [ ] Repeat with shared memory disabled, compare decoded output, and check cold/warm invocation behavior, `/tmp` use, peak memory, timeout margin, and cleanup.
- [ ] Retrieve the deployed layer/function configuration and verify the running Chrome version. Update hosted references only from AWS results and only after the intended access policy is in place.

See [the Lambda smoke workflow](lambda-arm64/README.md#lambda-smoke-test) and [layer packaging](../lambda-binaries/README.md).

## 5. Vercel Sandbox

- [ ] Create a fresh Vercel Sandbox using the runtime and resources from `@remotion/vercel`. Record the project, region, architecture, Node version, system glibc, vCPUs, and memory. Install the PR's local packages and pin their transitive workspace dependencies before downloading Chrome; the same-version registry package or a cached snapshot may still contain the previous browser.
- [ ] Exercise Remotion's sandbox setup, bundle upload, video rendering, and still rendering APIs. Check the downloaded executable's actual version and the renderer package used inside the sandbox.
- [ ] Verify the compositor patch on Vercel's Amazon Linux 2023 x64 runtime: its interpreter and library path must use the bundled glibc 2.35. Render the H.265 / `<OffthreadVideo>` fallback to prove the compositor runs. This patched environment does not establish support for unmodified Amazon Linux 2023 x64.
- [ ] Render the full `browser-test` and `html-in-canvas` compositions. A bounded smoke test must cover every section as described above and be recorded as partial coverage. Verify WebGL/WebGL2 drawing, proprietary-codec decoding, and supported WebCodecs round trips inside the sandbox.
- [ ] Prove shared-memory capture is active in render logs and FFmpeg arguments. Repeat a deterministic segment with shared memory disabled and compare decoded frames. Check `/dev/shm` capacity, capture backend, cleanup, and PNG/JPEG screenshot fallback.
- [ ] Download and decode the outputs, checking frame counts, duration, audio, representative pixels, and still-image output. Record concurrency, cache limits, peak memory, disk headroom, and OOM counters. Keep default-setting failures visible even if a bounded-cache retry passes; compare with the previous Chrome before classifying a regression. Record setup/upload failures separately, including any workaround needed to reach rendering.
- [ ] If the deployment reuses snapshots, create a snapshot with the candidate packages/browser and verify a resumed render. Invalidate older cached snapshots during the upgrade. Stop test sandboxes and remove temporary snapshots or Blob outputs after preserving evidence.

See the [Vercel API documentation](../docs/docs/vercel/index.mdx).

## 6. Shared-memory capture and fallback

- [ ] Run `mac-arm64/probe-fast-path.py <executable>` against each packaged native binary, not just in its build container. Validate published frame bytes, release, pool destruction, and file cleanup.
- [ ] On macOS/Linux, cover automatic POSIX shared memory and forced file-backed pools. On Lambda, require the actual file backend. On Linux, include missing/full `/dev/shm` and limited temporary storage.
- [ ] Render through Remotion and FFmpeg with shared memory enabled and disabled. Compare losslessly decoded frames, including alpha, color channels, odd dimensions, non-default scale, high resolution, consecutive frames, and concurrency. Record lossy-codec tolerances explicitly.
- [ ] Exercise cancellation, browser/tab restart, slot reuse, and multiple renders in one process. Check for hangs, stale frames, crashes, and leaked pools/files/processes.
- [ ] Windows currently has no shared-memory backend and its FFmpeg has no `remotionshm` device. Require the expected capability-unavailable response and a successful PNG/JPEG/video fallback render on native Windows. Do not label Windows shared memory as supported because the patched protocol exists.
- [ ] Test stills, image sequences, transparent output, and stock-browser fallback independently of parallel video encoding.

## 7. Chrome-for-Testing and stock fallbacks

- [ ] Verify the exact version in Google's [download manifest](https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json). HEAD-check both `chrome` and `chrome-headless-shell` for Linux x64/ARM64, macOS x64/ARM64, and Windows x64.
- [ ] Install through the public renderer API or a render with `--chrome-mode=chrome-for-testing`, then run the testbed on each native platform. Confirm the selected executable/version in logs. As of this checklist, `remotion browser ensure --chrome-mode=...` does not forward that option; do not mistake its headless-shell success for a Chrome-for-Testing test.
- [ ] Confirm ordinary screenshot capture works without the private CDP methods. Shared-memory support is not required for stock Chrome.
- [ ] Test an explicit stock headless-shell version override and the macOS Intel route. Verify launch, codecs, HTML-in-canvas, and output, not just HTTP availability. Older-glibc browser launches are diagnostics, not evidence of supported rendering.

## 8. WebCodecs, media, and audio

- [ ] Decode real H.264 video and AAC audio through HTML media elements and WebCodecs. Assert decoded pixels, dimensions, audio samples, and timestamps. Capability queries alone are insufficient.
- [ ] Preserve color primaries, transfer, matrix, and range in codec fixtures and decoder configuration. Raw H.264 without color metadata can produce different pixels because the browser must infer a color space.
- [ ] Test VP8/VP9 and Opus, seeking/trimming, first/last frames, looping, variable frame rate, and audio/video synchronization. Check H.265/HEVC only against the documented support of each platform/backend, recording unsupported combinations.
- [ ] Distinguish browser decoding (`<Html5Video>`, WebCodecs, `@remotion/media`) from FFmpeg decoding (`<OffthreadVideo>`). FFmpeg success does not prove proprietary codecs were included in Chrome.
- [ ] Render a sustained `<OffthreadVideo>` sequence with normal CDP network tracking enabled, and compare memory growth with the previous Chrome. On Vercel, run all 900 codec frames (1800–2699) without restarting the browser. Verify the fallback actually runs: Chrome 158 retained fetched frame blobs in DevTools and exhausted its blob quota near the end despite revoked object URLs and free disk space. Short renders missed the regression.
- [ ] Compare peak process memory and throughput with the previous working version, including 4K/8K **source** frames, simultaneous video layers, multiple tabs, and a low-memory Lambda. Record cache budgets and concurrency; a small output resolution does not make large source frames cheap. Inspect decoded output and preserve failed configurations alongside passing retries.
- [ ] Audit repeated `Response.blob()` calls in compositions and dependencies, including texture loaders, masks, and large-file helpers. On Chrome 158, zero DevTools response-body cache limits do not release these fetched blobs; the `<OffthreadVideo>` workaround covers only its own fetches. Check retention after object-URL revocation and garbage collection with CDP Network enabled.
- [ ] When changing CDP cache settings, verify redirects, HTTP errors, and failed-request diagnostics still work. Keep request tracking enabled; Remotion does not use `Network.getResponseBody`.
- [ ] Exercise supported WebCodecs encoders with real encode/decode output, hardware and software paths where applicable, and a client-side render. Check [`webcodecs-bugs`](../docs/docs/mediabunny/webcodecs-bugs.mdx) for regressions.

## 9. HTML-in-canvas regression matrix

- [ ] Review the [bug tracker](../docs/docs/html-in-canvas-bugs.mdx) and linked upstream reproducers. Record exact versions and actual results; a reported upstream fix is not a test pass.
- [ ] Run nesting and pixel-density compositions at DPR/scale 1 and 2; compare expected pixels and screenshots.
- [ ] Test nested `object-fit: contain/cover`, opacity 0→1, CSS scale 0→1, changing dimensions, and repeated snapshots/animated images.
- [ ] Force WebGL context loss after a canvas paint and test recovery. Run it with software and hardware backends, checking page/GPU crashes as well as exceptions.
- [ ] Test 2D `drawElementImage`, WebGL texture composition, WebGPU composition where supported, motion blur, and representative effects in preview and server rendering.
- [ ] Inspect output for blank/black textures, alpha, transforms, clipping, filters, and colors. A completed render can still be visually wrong. Compare the previous custom build and Google's same-version build to distinguish upstream changes from packaging/patch changes.
- [ ] Re-run every distinct crash signature in [#12369](https://github.com/remotion-dev/remotion/issues/12369), not only the opacity case. Use the issue's unmodified revision, keep zero-scale endpoints and two-second preview premounting, and render consecutive frames 181–1799 across transitions 275 and 534–537. Check real-time playback from frame 210 to completion in both native Studio and the Player, then verify seeking still works. Check the current composition too; later workarounds or composition edits can conceal the original failure. Keep [context loss](https://issues.chromium.org/issues/575053149) and any remaining signatures visible in the release decision.

## 10. Runtime correctness and regressions

- [ ] Run relevant upstream V8 regressions, including the object-literal cloning/migration cases from [#12680](https://github.com/remotion-dev/remotion/issues/12680). Assert returned values; disabling DCHECKs can hide a crash while preserving incorrect behavior.
- [ ] Check browser launch/close, CDP commands, page crashes/retries, timeouts, `delayRender`, fonts/emoji/CJK, SVG/CSS filters, network/media loading, and console errors using representative compositions.
- [ ] Compare render time, peak memory, startup time, executable/unpacked/ZIP size, and a sustained high-resolution render with the previous version on the same machine/configuration. Explain material regressions.
- [ ] Run relevant renderer/browser, web-renderer, and Lambda integration checks against the actual candidate binary. Record the executable/version used by CI; do not assume it uses the new download.

## 11. Release evidence and rollout

- [ ] Attach the completed matrix, commands, logs, representative frames/videos, size totals/headroom, and links to unresolved failures to the upgrade PR.
- [ ] Update artifact manifests, cache markers, layer staging inputs/license metadata, hosted layer references, and version documentation together. Verify reproducible layer packaging does not still point at the previous browser.
- [ ] Make an explicit decision on each failed/not-run gate. Only then roll out to other regions, verify the resulting layer versions, and perform a representative render outside the test region.
- [ ] Keep rollback instructions and prior artifacts available; remove temporary test functions/sites and temporary cross-account grants when no longer needed.

## Result record template

```text
Date / tester:
PR SHA / Remotion version:
Chrome version / Chromium commit / V8 revision:
Artifact URL / SHA-256 / actual executable version:
Platform / architecture / native or emulated / GPU backend:
Function + layer ARNs / rendering account / region:
Vercel project / sandbox + snapshot IDs / runtime / region / resources:
Commands / frame ranges / concurrency / capture mode:
Outputs / decoded frame count / pixel or audio comparison:
Uncompressed function + layers / limit / remaining headroom:
Passed:
Failed (issue + release decision):
Not run (reason + owner):
Rollback artifacts / cleanup:
```
