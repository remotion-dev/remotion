---
name: remotion-chromium-binary-release
description: Release Remotion Chromium headless-shell binaries after chrome-compile builds. Use when uploading Chromium/Chrome headless shell zips to remotion.media, validating BrowserFetcher-compatible zip layout, mapping chrome-compile artifact names to get-chrome-download-url.ts URL names, comparing or handing off Chromium binary updates between remotion-dev/chrome-compile and remotion-dev/remotion, or documenting the final release flow.
---

# Remotion Chromium Binary Release

Use this after `remotion-dev/chrome-compile` has produced Chromium
`headless_shell` zips and the user wants them usable by `remotion-dev/remotion`.
The fragile parts are the public object names, zip internal folders, and R2
upload verification.

## Required Context

Read `references/release-checklist.md` before uploading or declaring a release
complete.

If the task mentions R2, `remotion.media`, or large asset upload, also use the
canonical Remotion upload skill from GitHub:

https://github.com/remotion-dev/remotion/blob/main/.agents/skills/upload-r2/SKILL.md

When a local `remotion-dev/remotion` checkout is available, prefer the copy of
that same skill from the checkout so credential paths match the machine.

## Workflow

1. Determine the Remotion downloader contract.
   - Read the target `packages/renderer/src/browser/get-chrome-download-url.ts`.
   - Read the matching `BrowserFetcher.ts` extraction logic.
   - Do not infer URL names from chrome-compile output names alone.

2. Validate local artifacts before upload.
   - Check all required zips exist.
   - Run zip integrity checks.
   - Verify exactly one top-level folder per zip.
   - Verify the expected executable filename inside each folder.
   - Verify Amazon Linux packages include required runtime libraries.

3. Map build output names to public object names.
   - `output/chromium-headless-shell-linux64.zip`
     -> `chromium-headless-shell-linux-x64-<version>.zip`
   - `output/chromium-headless-shell-linux-arm64.zip`
     -> `chromium-headless-shell-linux-arm64-<version>.zip`
   - `output/chromium-headless-shell-amazon-linux2023-x64.zip`
     -> `chromium-headless-shell-amazon-linux-x64-<version>.zip`
   - `output/chromium-headless-shell-amazon-linux2023-arm64.zip`
     -> `chromium-headless-shell-amazon-linux-arm64-<version>.zip`

4. Verify public objects do not already exist unless overwriting is intended.
   Use `curl -I` on `https://remotion.media/<key>`.

5. Upload via R2 using the Remotion checkout's `packages/remotion-media/.env`.
   Never print credential values.

6. Verify each public URL after upload.
   - Require `HTTP 200`.
   - Check `content-length` equals the local file size.
   - Also check the `?clear` URL form if `get-chrome-download-url.ts` uses it.

7. Handoff to `remotion-dev/remotion`.
   State the exact uploaded URLs and note that implementation work may continue
   in `remotion-dev/remotion`, typically by bumping `TESTED_VERSION`,
   `PLAYWRIGHT_VERSION` if needed, and any Amazon Linux custom URL branches.

## Guardrails

- Do not upload until the local zip layout matches `BrowserFetcher`.
- Do not expose R2 secrets.
- Do not claim runtime compatibility from zip checks alone; say whether a
  downstream Remotion run actually tested the binaries.
- Remember that `chrome-compile` docs/build scripts and `remotion` downloader
  code can be updated in separate PRs.
