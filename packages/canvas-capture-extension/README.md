# Remotion Canvas Capture Chrome extension

Record an element—or a whole webpage—as a high-resolution H.264 MP4 or VP9 WebM using Chromium's experimental HTML-in-canvas implementation.

## Build and install

1. Run `bun run make` in this directory.
2. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select `packages/canvas-capture-extension/dist`.
4. Enable `chrome://flags/#canvas-draw-element` and restart Chrome if HTML-in-canvas is not already enabled.

Click the extension icon on a webpage to open the recorder window. Choose H.264 MP4 or VP9 WebM, set the output scale, select an area (the page is focused while you drag, but the recorder window remains open, and the extension picks the deepest DOM element containing the selection) or choose **Whole page**, then press **Record**. The recorder displays the rounded output dimensions and only enables **Record** after the browser confirms that Mediabunny's exact high-quality, realtime configuration is supported. The selected element is drawn at the display's native pixel density, then the crop is copied into a reusable, correctly sized `OffscreenCanvas`. Enable **Include page background** to render the whole page subtree and crop it to the selected area instead of isolating the selected element. Recording continues if the recorder window closes; click the extension icon to reopen it, then press **Stop and open in Convert** to load the recording in [remotion.dev/convert](https://remotion.dev/convert) without downloading it first, or **Stop and download** to save it directly.

The chosen element is temporarily placed inside a `layoutSubtree` canvas while recording and restored afterward. Websites that rely on direct-child CSS selectors may look different during capture. Chrome's own pages and the Chrome Web Store do not allow extension script injection.
