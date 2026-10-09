---
name: update-chrome-binaries-test-region
description: Publish Remotion Lambda Chrome binaries to the eu-central-1 test region and update hosted layer and Chrome version references. Use when updating Chrome binaries before full regional rollout.
---

# Update Chrome Binaries Test Region

## AWS setup

- Confirm the AWS CLI is logged into account `678892195805` by running `aws sts get-caller-identity`. If not, ask the user to log in.
- Export AWS credentials into the shell by running `eval "$(aws configure export-credentials --format env)"`. The Lambda client checks for `AWS_ACCESS_KEY_ID` and does not pick up SSO or Identity Center credentials on its own.
- From `packages/lambda`, run `bun src/admin/make-layer-public.ts --region=eu-central-1` to publish all 5 layers: fonts, chromium, emoji-apple, emoji-google, cjk.
- The `eval` and the `bun` command must run in the same shell invocation because the env vars do not persist across shell calls.
- Verify the output prints a `LayerArn` and `Version` for each of the 5 layers and a final JSON dump with the published regions populated.

## Update hosted layers

Update `packages/lambda/src/shared/hosted-layers.ts` by copying the JSON dump from the script's stdout. Do not manually bump version numbers.

The script prints, after several blank lines, a complete `HostedLayers` object showing the exact `layerArn` and `version` AWS returned for every layer it just published. Replace the corresponding region entries in `hosted-layers.ts` with those values.

For the test phase (`--region=eu-central-1`), only `eu-central-1` is updated; other regions intentionally stay on their old versions until rollout. If the script was invoked with `--skip=<region>`, leave skipped regions untouched.

## Update Chrome references

Use the Chrome version supplied by the user, such as `157.0.8080.0`. Default downloads no longer use a Playwright revision. Verify the same Chrome version is available for all supported platforms in [Google's Chrome for Testing download metadata](https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json). If an exact match is unavailable, choose the closest available version and keep its version/cache marker accurate. Explicit numeric Playwright revision overrides on Linux ARM64 remain supported.

Update:

- `packages/renderer/src/browser/get-chrome-download-url.ts`: `TESTED_VERSION`. The Remotion and Google CDN URLs use this version, including the Amazon Linux builds and Linux ARM64 fallbacks. Verify all five Remotion archives and both Google browser modes for Linux x64/ARM64, macOS x64/ARM64 and Windows x64. Check `BrowserFetcher.ts` executable paths against the archive layout when changing providers.
- Before changing URLs, verify the new binaries exist with `curl -sI` against the new hard-coded URLs and the templated `chromium-headless-shell-linux-{arm64,x64}-<version>.zip?clearcache` URLs that follow `TESTED_VERSION`. Continue only when all return HTTP 200; otherwise ask the user to upload the missing builds to `remotion.media`.
- `packages/lambda/src/admin/make-layer-public.ts`: the `Chromium <version>, compiled from source.` license string passed to `PublishLayerVersionCommand`.
- `packages/docs/docs/lambda/runtime.mdx`: prepend a new row to the "Chrome" version table for the next Remotion release. Determine the next version from `packages/core/package.json` and increment the patch.
- `packages/docs/docs/miscellaneous/chrome-headless-shell.mdx`: prepend a new row to the version table and update the example version string in the "Version tracking" section.
- `packages/docs/docs/renderer/ensure-browser.mdx`: update both `version: '<old>'` occurrences in example code blocks.

## Docker verification

Run the Docker matrix tests in `packages/dockerfiles/` with `./run.sh` against the new Chrome binary. Make sure Docker Desktop is running first.

The tests render:

- `browser-test`: Three.js, WebGL, and codec smoke test.
- `html-in-canvas`: experimental WICG `drawElementImage()` and `canvas.requestPaint()` APIs.

Outputs land in `packages/dockerfiles/out/<platform>.mp4` and `packages/dockerfiles/out/<platform>-html-in-canvas.mp4`.

The Dockerfiles install the local workspace build of `@remotion/cli` plus transitive deps, not the published version. Source changes in `@remotion/renderer` are picked up before publishing. `run.sh` runs `pack-cli.ts`, which walks `@remotion/cli` transitive `workspace:*` deps, runs `bun pm pack` for each into `packages/dockerfiles/tarballs/`, and emits `local-cli-package.json` with every tarball as a direct dependency and override.

If a new composition is added to the Docker test matrix, register it in `packages/example/src/BrowserTestRoot.tsx` and add a corresponding `RUN remotion render /usr/app/bundle <id> /usr/app/<filename>.mp4` line plus `docker cp` extraction in `run.sh`.

The `<HtmlInCanvas>` runtime check in `packages/core/src/HtmlInCanvas.tsx` requires `ctx.drawElementImage`, `canvas.requestPaint`, `canvas.captureElementImage`, and `transferControlToOffscreen`, which Chrome 149+ exposes when `--enable-features=CanvasDrawElement` is passed. If `html-in-canvas` renders fail with `"HTML in Canvas is not supported"` while `browser-test` passes, the most likely cause is a Chrome version mismatch.

Do not proceed to publishing all regions until the test region has been verified end-to-end.
