# Remotion Canvas Capture Chrome extension

Record an element—or a whole webpage—as a high-resolution WebM using Chromium's experimental HTML-in-canvas implementation.

## Build and install

1. Run `bun run make` in this directory.
2. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select `packages/canvas-capture-extension/dist`.
4. Enable `chrome://flags/#canvas-draw-element` and restart Chrome if HTML-in-canvas is not already enabled.

Click the extension icon on a webpage to open the recorder. Set the output scale, select an area (the extension picks the deepest DOM element containing it and encodes only the drawn crop using Mediabunny's `CropRectangle` transform) or choose **Whole page**, then press **Record**. Press **Stop and open in Convert** to load the recording in [remotion.dev/convert](https://remotion.dev/convert) without downloading it first, or **Stop and download WebM** to save it directly.

The chosen element is temporarily placed inside a `layoutSubtree` canvas while recording and restored afterward. Websites that rely on direct-child CSS selectors may look different during capture. Chrome's own pages and the Chrome Web Store do not allow extension script injection.
