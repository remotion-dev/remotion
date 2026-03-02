---
image: /generated/articles-docs-renderer-make-cancel-signal.png
id: make-cancel-signal
title: makeCancelSignal()
crumb: '@remotion/renderer'
---

# makeCancelSignal()<AvailableFrom v="3.0.15" />

_Part of the `@remotion/renderer` package._

This function returns a signal and a cancel function that allows to you cancel a render triggered using [`renderMedia()`](/docs/renderer/render-media), [`renderStill()`](/docs/renderer/render-still), [`renderFrames()`](/docs/renderer/render-frames) or [`stitchFramesToVideo()`](/docs/renderer/stitch-frames-to-video)
.

## Example

```tsx twoslash
import {VideoConfig} from 'remotion';
const composition: VideoConfig = {
  durationInFrames: 1000000,
  fps: 30,
  height: 720,
  id: 'react-svg',
  width: 1280,
  defaultProps: {},
  props: {},
  defaultCodec: null,
  defaultOutName: null,
  defaultVideoImageFormat: null,
  defaultPixelFormat: null,
  defaultProResProfile: null,
};
// ---cut---
import {makeCancelSignal, renderMedia} from '@remotion/renderer';

const {cancelSignal, cancel} = makeCancelSignal();

// Note that no `await` is used yet
const render = renderMedia({
  composition,
  codec: 'h264',
  serveUrl: '/path/to/bundle',
  outputLocation: 'out/render.mp4',
  cancelSignal,
});

// Cancel render after 10 seconds
setTimeout(() => {
  cancel();
}, 10000);

// If the render completed within 10 seconds, renderMedia() will resolve
await render;

// If the render did not complete, renderMedia() will reject
// ==> "[Error: renderMedia() got cancelled]"
```

## API

Calling `makeCancelSignal` returns an object with two properties:

- `cancelSignal`: An object to be passed to one of the above mentioned render functions
- `cancel`: A function you should call when you want to cancel the render.

## Compatibility

<CompatibilityTable chrome={false} firefox={false} safari={false} nodejs={true} bun={true} serverlessFunctions={false} clientSideRendering={false} serverSideRendering={true} player={false} studio={false} />

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/renderer/src/make-cancel-signal.ts)
- [`renderMedia()`](/docs/renderer/render-media)
- [`renderStill()`](/docs/renderer/render-still)
- [`renderFrames()`](/docs/renderer/render-frames)
- [`stitchFramesToVideo()`](/docs/renderer/stitch-frames-to-video)
