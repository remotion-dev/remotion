---
id: make-cancel-signal
title: makeCancelSignal()
---

This function returns a signal and a cancel function that allows to you cancel a render triggered using `renderMedia()`, `renderFrames()` or `renderMedia()`.

```tsx twoslash
// @module: ESNext
// @target: ESNext
import { SmallTCompMetadata } from "remotion";
const composition: SmallTCompMetadata = {
  durationInFrames: 1000000,
  fps: 30,
  height: 720,
  id: "react-svg",
  width: 1280,
};
// ---cut---
import { makeCancelSignal, renderMedia } from "@remotion/renderer";

const { cancelSignal, cancel } = makeCancelSignal();

// Note that no `await` is used yet
const render = renderMedia({
  composition,
  codec: "h264",
  serveUrl: "https://silly-crostata-c4c336.netlify.app/",
  outputLocation: "out/render.mp4",
  cancelSignal,
});

// Cancel render after 10 seconds
setTimeout(() => {
  cancel();
}, 10000);

// If the render completed within 10 seconds, renderMedia() will resolve
await render;

// If the render did not complete. renderMedia will reject
// ==> "[Error: renderMedia() got cancelled]"
```
