# Remotion Chromium Binary Release Checklist

## What Was Missing From The Normal Docs

- `chrome-compile` emits short local artifact names, but
  `get-chrome-download-url.ts` uses version-suffixed `remotion.media` object
  names.
- `BrowserFetcher.ts` cares about internal zip folders and executable names,
  not just whether a zip exists.
- R2 upload uses the `parser-media` bucket behind `https://remotion.media/`,
  with credentials in the Remotion checkout's `packages/remotion-media/.env`.
- The implementation may continue in `remotion-dev/remotion` after binaries are
  uploaded; do not assume the `chrome-compile` PR is the only handoff.
- Chromium 151 can produce zero-byte `libEGL.so` and `libGLESv2.so`; this is
  expected for these artifacts, and strip must skip empty files.

## Current v151 Artifact Mapping

For Chromium `151.0.7893.0`:

| Local chrome-compile zip | Public remotion.media key |
| --- | --- |
| `output/chromium-headless-shell-linux64.zip` | `chromium-headless-shell-linux-x64-151.0.7893.0.zip` |
| `output/chromium-headless-shell-linux-arm64.zip` | `chromium-headless-shell-linux-arm64-151.0.7893.0.zip` |
| `output/chromium-headless-shell-amazon-linux2023-x64.zip` | `chromium-headless-shell-amazon-linux-x64-151.0.7893.0.zip` |
| `output/chromium-headless-shell-amazon-linux2023-arm64.zip` | `chromium-headless-shell-amazon-linux-arm64-151.0.7893.0.zip` |

## Expected Zip Layout

| Variant | Top-level folder | Executable |
| --- | --- | --- |
| Linux x64 | `chrome-headless-shell-linux64/` | `chrome-headless-shell` |
| Linux ARM64 | `chrome-headless-shell-linux-arm64/` | `headless_shell` |
| Amazon Linux x64 | `chromium-headless-shell-amazon-linux2023-x64/` | `headless_shell` |
| Amazon Linux ARM64 | `chromium-headless-shell-amazon-linux2023-arm64/` | `headless_shell` |

Amazon Linux zips must bundle runtime libraries. At minimum:

- x64: `libnss3.so`, `libnssutil3.so`, `libsoftokn3.so`, `libnspr4.so`,
  `libplc4.so`, `libplds4.so`, `libfreebl3.so`, `libfreeblpriv3.so`,
  `libexpat.so.1`, `libdbus-1.so.3`, `libsystemd.so.0`, `libgcc_s.so.1`.
- ARM64: `libnss3.so`, `libnssutil3.so`, `libsoftokn3.so`, `libnspr4.so`,
  `libplc4.so`, `libplds4.so`, `libgcc_s-14-20250110.so.1`,
  `libdbus-1.so.3`, `libsystemd.so.0`.

## Validation Command

Run from `remotion-dev/chrome-compile`:

```bash
python3 - <<'PY'
from pathlib import Path
import zipfile

version = "151.0.7893.0"
artifacts = [
    ("linux-x64", "output/chromium-headless-shell-linux64.zip",
     f"chromium-headless-shell-linux-x64-{version}.zip",
     "chrome-headless-shell-linux64/", "chrome-headless-shell",
     ["libEGL.so", "libGLESv2.so", "libvk_swiftshader.so", "libvulkan.so.1", "vk_swiftshader_icd.json"]),
    ("linux-arm64", "output/chromium-headless-shell-linux-arm64.zip",
     f"chromium-headless-shell-linux-arm64-{version}.zip",
     "chrome-headless-shell-linux-arm64/", "headless_shell",
     ["libEGL.so", "libGLESv2.so", "libvk_swiftshader.so", "libvulkan.so.1", "vk_swiftshader_icd.json"]),
    ("amazon-linux-x64", "output/chromium-headless-shell-amazon-linux2023-x64.zip",
     f"chromium-headless-shell-amazon-linux-x64-{version}.zip",
     "chromium-headless-shell-amazon-linux2023-x64/", "headless_shell",
     ["libEGL.so", "libGLESv2.so", "libvk_swiftshader.so", "libvulkan.so.1", "vk_swiftshader_icd.json",
      "libnss3.so", "libnssutil3.so", "libsoftokn3.so", "libnspr4.so", "libplc4.so", "libplds4.so",
      "libfreebl3.so", "libfreeblpriv3.so", "libexpat.so.1", "libdbus-1.so.3", "libsystemd.so.0", "libgcc_s.so.1"]),
    ("amazon-linux-arm64", "output/chromium-headless-shell-amazon-linux2023-arm64.zip",
     f"chromium-headless-shell-amazon-linux-arm64-{version}.zip",
     "chromium-headless-shell-amazon-linux2023-arm64/", "headless_shell",
     ["libEGL.so", "libGLESv2.so", "libvk_swiftshader.so", "libvulkan.so.1", "vk_swiftshader_icd.json",
      "libnss3.so", "libnssutil3.so", "libsoftokn3.so", "libnspr4.so", "libplc4.so", "libplds4.so",
      "libgcc_s-14-20250110.so.1", "libdbus-1.so.3", "libsystemd.so.0"]),
]

for variant, local, key, folder, binary, required in artifacts:
    path = Path(local)
    if not path.exists():
        raise SystemExit(f"missing {local}")
    with zipfile.ZipFile(path) as z:
        bad = z.testzip()
        if bad:
            raise SystemExit(f"{variant}: bad zip member {bad}")
        names = set(z.namelist())
        top = sorted({n.split("/")[0] for n in names if n})
        if top != [folder.rstrip("/")]:
            raise SystemExit(f"{variant}: unexpected top folders {top}")
        missing = [folder + name for name in [binary, *required] if folder + name not in names]
        if missing:
            raise SystemExit(f"{variant}: missing {missing}")
    print("ok", variant, local, "->", key)
PY
```

## R2 Upload Pattern

Use the upload-r2 skill when available. The key operational details are:

```bash
bun --env-file=<remotion-checkout>/packages/remotion-media/.env -e "<S3Client upload script>"
```

S3-compatible settings:

- Endpoint: `https://2fe488b3b0f4deee223aef7464784c46.r2.cloudflarestorage.com`
- Bucket: `parser-media`
- Required env vars: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

Before upload, `curl -I https://remotion.media/<key>` should usually be `404`
for a new version. After upload, require `HTTP 200` and matching
`content-length`.

## Remotion Handoff Notes

When handing off to `remotion-dev/remotion`, include:

- All uploaded URLs.
- The Chrome version.
- Whether `get-chrome-download-url.ts` was updated to point to them.
- Whether `BrowserFetcher.ts` needs new `possibleSubdirs` entries.
- Whether runtime testing passed in Remotion, not only zip validation.
