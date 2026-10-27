# restructure notes — historical

> **As of Chromium 149.0.7790.0 the manual restructuring described below is
> baked into the build scripts.** See the top-level `README.md` →
> "Output zip layout requirements" for the canonical layout each variant must
> emit. Keep this file as a postmortem; do not run these commands against new
> builds.

## What the renderer expects

Remotion's `packages/renderer/src/browser/BrowserFetcher.ts` builds the path
to Chromium from a hard-coded `<wrapping-folder>/<binary-name>` per platform.
If either part is wrong, extraction silently produces a path that
`getExecutablePath` can't find at runtime.

| Variant            | Wrapping folder inside zip                        | Binary name             |
| ------------------ | ------------------------------------------------- | ----------------------- |
| `linux-x64`        | `chrome-headless-shell-linux64/`                  | `chrome-headless-shell` |
| `linux-arm64`      | `chrome-headless-shell-linux-arm64/`              | `headless_shell`        |
| `amazon-linux-x64` | `chromium-headless-shell-amazon-linux2023-x64/`   | `headless_shell`        |
| `lambda-arm64`     | `chromium-headless-shell-amazon-linux2023-arm64/` | `headless_shell`        |

## What was wrong with the first 149 upload

Four zips were published before `BrowserFetcher`'s extractor was checked. Two
broke at runtime:

1. **`chromium-headless-shell-linux-x64-149.0.7790.0.zip`** — binary inside was
   `headless_shell` instead of `chrome-headless-shell`. The post-extract rename
   loop in `BrowserFetcher.ts` only fires when the source binary is named
   `chrome`, so `headless_shell` was left untouched.
2. **`chromium-headless-shell-amazon-linux-arm64-149.0.7790.0.zip`**
   (and `-nopdf`, `-noprint`) — files were at the zip root with no wrapping
   subdirectory. The extractor's `possibleSubdirs` lookup didn't find
   `chromium-headless-shell-amazon-linux2023-arm64/` and gave up.

The other two were OK:

- `chromium-headless-shell-amazon-linux-x64-149.0.7790.0.zip` already had the
  right wrapping folder.
- `chromium-headless-shell-linux-arm64-149.0.7790.0.zip` had a folder name
  that coincidentally matched `chrome-headless-shell-${platform}` (where
  platform = `linux-arm64`), so it worked even without a `possibleSubdirs`
  entry.

## Historical fix (do NOT use for new builds)

This is the manual fix that was applied to the broken 149 zips before the
build scripts were updated. It is preserved here so older zips can be
re-shaped if necessary.

```bash
# Wrap a flat zip into the AL2023 arm64 layout
mkdir -p temp_lambda/chromium-headless-shell-amazon-linux2023-arm64
unzip -q chromium-headless-shell-lambda-arm64.zip \
  -d temp_lambda/chromium-headless-shell-amazon-linux2023-arm64
( cd temp_lambda \
  && zip -r ../chromium-headless-shell-amazon-linux2023-arm64.zip \
       chromium-headless-shell-amazon-linux2023-arm64 )
rm -rf temp_lambda

# Rename the linux-x64 binary in place
mkdir -p temp_x64 && unzip -q chromium-headless-shell-linux64.zip -d temp_x64
mv temp_x64/chrome-headless-shell-linux64/headless_shell \
   temp_x64/chrome-headless-shell-linux64/chrome-headless-shell
( cd temp_x64 && zip -r -X ../chromium-headless-shell-linux64.zip \
                          chrome-headless-shell-linux64 )
rm -rf temp_x64
```
