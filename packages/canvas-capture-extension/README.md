# Remotion Canvas Capture Chrome extension

Record an area—or a whole webpage—as a high-resolution H.264 MP4 or VP9 WebM using Chromium's experimental HTML-in-canvas implementation.

## Browser setup on macOS

Canvas Capture requires Chrome 157.0.8080.0 or newer with Canvas Draw Element enabled. You can use Chrome, Chrome Canary, or Chrome for Testing as long as the browser meets this minimum. The extension also checks whether the HTML-in-canvas API and video encoding configuration are available before recording.

To install a compatible Chrome for Testing build, run:

```bash
.agents/skills/install-canvas-capture-browser/scripts/install-browser.sh
```

The installer uses a compatible release from Google's Chrome for Testing channels and installs it at:

```text
/Users/jonathanburger/Applications/Recorder Chrome.app
```

Launch it with a dedicated profile and the HTML-in-canvas feature enabled:

```bash
'/Users/jonathanburger/Applications/Recorder Chrome.app/Contents/MacOS/Google Chrome for Testing' \
  --user-data-dir='/Users/jonathanburger/Library/Application Support/Remotion Canvas Capture' \
  --enable-features=CanvasDrawElement \
  --enable-blink-features=CanvasDrawElement \
  --no-first-run \
  --no-default-browser-check
```

Load the unpacked extension from the durable installation directory:

```text
/Users/jonathanburger/Applications/Remotion Canvas Capture Extension
```

## Development

Close Recorder Chrome if it is already using the dedicated Canvas Capture
profile, then run:

```bash
cd packages/canvas-capture-extension
bun run dev
```

WXT starts Vite, writes the development extension to the durable
`/Users/jonathanburger/Applications/Remotion Canvas Capture Extension Dev`
directory, launches Chrome for Testing with the required feature
flags and persistent profile, and loads the extension automatically.

To use another Chrome 157.0.8080.0 or newer executable, set
`CANVAS_CAPTURE_BROWSER_EXECUTABLE` when starting development:

```bash
CANVAS_CAPTURE_BROWSER_EXECUTABLE='/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary' bun run dev
```

Open a regular webpage and click the extension icon to show the in-page capture
controls. WXT rebuilds and reloads the relevant extension contexts when source
files change.

The development extension is separate from the manually loaded production
extension, so its path and extension ID remain stable across worktrees.

## Build and install

1. From the repository root, run `.agents/skills/canvas-capture-extension/scripts/rebuild-extension.sh --repo "$PWD"`. This creates the production WXT bundle and installs the complete unpacked extension outside the worktree. Building does not require an installed browser.
2. In Chrome 157.0.8080.0 or newer, open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select `/Users/jonathanburger/Applications/Remotion Canvas Capture Extension`.
4. Enable `chrome://flags/#canvas-draw-element` and restart Chrome if HTML-in-canvas is not already enabled.

Click the extension icon on a webpage to toggle the in-page controls. Select an
area or choose **Entire page** to target the full browser viewport, then start
recording. Captures default to a 2K (2560×1440) bounding resolution. Click the
zoom value next to the selected area to expose a slider and adjust the capture
scale directly. The default capture scale adapts to the selected area, so
smaller areas are enlarged more while preserving their aspect ratio. The
controls display the selected format and rounded output dimensions and only
enable recording after the browser confirms that Mediabunny's exact
high-quality, realtime configuration is supported. The whole page subtree is
drawn at the display's native pixel density, then the selected crop is copied
into a reusable, correctly sized `OffscreenCanvas`. The controls are mounted
outside the captured body subtree, so they do not appear in area or whole-page
recordings. Stop the recording, then open it directly in
[remotion.dev/new](https://remotion.dev/new), inspect it in
[remotion.dev/convert](https://remotion.dev/convert), or save it to disk.

The page contents are temporarily placed inside a `content="drawable"` canvas while recording and restored afterward. The extension also sets `layoutSubtree` for older Chromium versions. Existing canvases and canvases added inside the captured subtree during recording temporarily receive `content="drawable"` to avoid Chromium clipping their bitmaps at the origin; their original attributes are restored afterward. Websites that rely on direct-child CSS selectors may look different during capture. Chrome's own pages and the Chrome Web Store do not allow extension script injection.

Drag previews are copied into recordings at the cursor position. For default
previews, the extension snapshots the draggable source after the page paints
its drag-start changes and preserves the point where it was grabbed. Ordinary
page elements retain their composed background, including backgrounds behind
translucent fills. Images and elements that establish their own stacking context
retain their transparency. Custom previews created with `DataTransfer.setDragImage()`
replace that snapshot and use the supplied hotspot offset. The extension
preserves temporary HTML previews before the page removes them and supports
image and canvas sources. Previews are added only to recorded frames and
disappear on drop or drag end. This recreates the content without Chrome's
native translucency, cursor badges, or drop animation. Text-selection drags and
drags originating in other tabs or applications are not captured. Shadow DOM
and cross-origin content may not appear in copied previews.
