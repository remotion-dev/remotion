# Remotion Canvas Capture Chrome extension

Record an area—or a whole webpage—as a high-resolution H.264 MP4 or VP9 WebM using Chromium's experimental HTML-in-canvas implementation.

## Pinned browser setup on macOS

Use [Chrome for Testing `150.0.7842.0` at revision `r1631007`](https://storage.googleapis.com/chrome-for-testing-per-commit-public/mac-arm64/r1631007/chrome-mac-arm64.zip) on Apple Silicon. This is the exact Chromium revision where the required HTML-in-canvas implementation is known to work. Chrome for Testing does not auto-update, and unlike an open-source Chromium build, it is built with proprietary codec support so the browser can both encode and play the H.264 MP4 produced by this extension.

After extracting the archive, move and rename the app to a durable location such as:

```text
/Users/jonathanburger/Applications/Recorder Chrome.app
```

Launch it with a dedicated profile and the HTML-in-canvas feature enabled:

```bash
'/Users/jonathanburger/Applications/Recorder Chrome.app/Contents/MacOS/Google Chrome for Testing' \
  --user-data-dir='/Users/jonathanburger/Library/Application Support/Chrome for Testing Canvas Capture r1631007' \
  --enable-features=CanvasDrawElement \
  --enable-blink-features=CanvasDrawElement \
  --disable-component-update \
  --no-first-run \
  --no-default-browser-check
```

Load the unpacked extension from the durable installation directory:

```text
/Users/jonathanburger/Applications/Remotion Canvas Capture Extension
```

Do not replace this browser with Chrome Canary or a normal Chrome installation: those update automatically and may remove or change the experimental API. Because this browser is intentionally pinned and will not receive security updates, only use it with trusted websites.

## Development

Close Recorder Chrome if it is already using the dedicated Canvas Capture
profile, then run:

```bash
cd packages/canvas-capture-extension
bun run dev
```

WXT starts Vite, writes the development extension to the durable
`/Users/jonathanburger/Applications/Remotion Canvas Capture Extension Dev`
directory, launches the pinned Chrome for Testing with the required feature
flags and persistent profile, and loads the extension automatically.

Open a regular webpage and click the extension icon. Keep the recorder window
open while editing files in `src/entrypoints/recorder`: React and CSS edits use
Vite HMR without rebuilding or reloading the window. WXT rebuilds and reloads
the relevant extension contexts when the background, capture, receiver, or
manifest changes.

The development extension is separate from the manually loaded production
extension, so its path and extension ID remain stable across worktrees.

## Build and install

1. From the repository root, run `.agents/skills/canvas-capture-extension/scripts/rebuild-extension.sh --repo "$PWD"`. This verifies the pinned Chrome for Testing version, creates the production WXT bundle, and installs the complete unpacked extension outside the worktree. If the browser is not at the path shown above, also pass `--browser-executable <path>`.
2. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select `/Users/jonathanburger/Applications/Remotion Canvas Capture Extension`.
4. Enable `chrome://flags/#canvas-draw-element` and restart Chrome if HTML-in-canvas is not already enabled.

Click the extension icon on a webpage to open the recorder window. Choose H.264 MP4 or VP9 WebM, set the output scale, select an area (the page is focused while you drag, but the recorder window remains open) or choose **Whole page**, then press **Record**. The recorder displays the rounded output dimensions and only enables **Record** after the browser confirms that Mediabunny's exact high-quality, realtime configuration is supported. The whole page subtree is drawn at the display's native pixel density, then the selected crop is copied into a reusable, correctly sized `OffscreenCanvas`. Recording continues if the recorder window closes; click the extension icon to reopen it, then press **Stop and open in Convert** to load the recording in [remotion.dev/convert](https://remotion.dev/convert) without downloading it first, or **Stop and download** to save it directly.

The page contents are temporarily placed inside a `layoutSubtree` canvas while recording and restored afterward. Websites that rely on direct-child CSS selectors may look different during capture. Chrome's own pages and the Chrome Web Store do not allow extension script injection.
