---
name: update-ffmpeg
description: Update the monorepo FFmpeg archives, regenerate bindings, rebuild compositor binaries, and validate a single Remotion pull request. Use after the seven-platform FFmpeg build completes.
---

# Update Remotion FFmpeg

The FFmpeg build recipes, Rust bindings and wrapper live in [`packages/compositor/ffmpeg`](../../../packages/compositor/ffmpeg/README.md). The compositor and wrapper use local Cargo dependencies, and updates are reviewed in a single Remotion pull request.

## Collect and import

Use the full source commit SHA for the intended FFmpeg build.

Explicitly trigger the CircleCI pipeline on the branch containing that commit using the web app's **Trigger Pipeline** button or the API. No parameters are needed: the workflow only runs for `pipeline.trigger.type == "api"`, which covers both methods. See the [trigger instructions](../../../packages/compositor/ffmpeg/README.md#rebuild-ffmpeg). Wait for its five jobs and the macOS GitHub Actions build for the same commit to succeed. Then collect artifacts from the Remotion repository root:

```sh
node packages/compositor/ffmpeg/collect-artifacts.mjs --sha <full-source-sha>
```

The collector requires successful GitHub Actions and CircleCI builds for that same SHA. Do not combine runs or fill missing targets from an older build. Keep the returned `MANIFEST.json` and `SHA256SUMS` with the seven archives.

Upload the verified archives to a new immutable directory on `remotion.media` using the repository's R2 upload workflow. Never overwrite an existing release directory. Then run:

```sh
node packages/compositor/ffmpeg/import-artifacts.mjs <artifact-directory> <immutable-https-base-url>
```

The importer verifies local and hosted archive checksums before updating `assets.json` and the seven canonical generated bindings. Archives remain ignored downloads. Do not hand-edit bindings.

## Rebuild and validate

Install dependencies with `bun install --frozen-lockfile`. From `packages/compositor`, install missing cross-compilation toolchains with `bun install-toolchain.ts`, then run `bun run build-all`.

Require all seven targets: Windows x64 GNU, macOS ARM64/x64, Linux ARM64/x64 GNU/musl. On macOS, use an MSVCRT-targeting `x86_64-w64-mingw32-gcc`. Verify `objdump -p packages/compositor-win32-x64-msvc/remotion.exe` imports `msvcrt.dll` and no `api-ms-win-crt-*` or `ucrtbase.dll`.

From the repository root, run `bun run build`, `bun run stylecheck`, and `git diff --check`. Inspect the FFmpeg metadata/binding changes and all seven rebuilt compositor packages. Do not include unrelated changes.

When a PR is requested, read [`../pr/SKILL.md`](../pr/SKILL.md) and [`../pr-name/SKILL.md`](../pr-name/SKILL.md). Include the full source SHA, hosted archive directory, CI provenance, rebuilt targets and validation results. Use the title:

```text
`@remotion/compositor`: Update FFmpeg and rebuild binaries
```

`packages/lambda-binaries` packages Chromium and fonts and does not need a rebuild for an FFmpeg-only update.
