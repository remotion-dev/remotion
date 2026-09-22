---
name: video-matting
description: AI background removal for video using @remotion/video-matting
metadata:
  tags: video-matting, background-removal, matting, webgpu, foreground, alpha, green-screen
---

# Removing the background from a video (AI matting)

Use `@remotion/video-matting` when the user wants the subject cut out of footage that has **no green screen** — it runs a real segmentation model (not chroma-keying) locally in the browser over WebGPU.

For footage that **does** have a green/blue screen, prefer `colorKey()` from [effects.md](effects.md) instead — it's much cheaper and needs no model download.

## Prerequisites

```bash
npx remotion add @remotion/video-matting @huggingface/transformers
```

Available from Remotion `4.0.523`. Requires WebGPU (Chrome/Edge; not supported in Node.js/Bun render workers without a WebGPU-capable browser). Always check support first — do not assume WebGPU is available:

```tsx
import { canUseVideoMatting } from "@remotion/video-matting";

const result = await canUseVideoMatting({ model: "modnet" });
if (!result.supported) {
  // result.reason is one of: window-undefined, webgpu-unavailable,
  // webgpu-requires-secure-context, shader-f16-unavailable
  throw new Error(result.detailedReason);
}
```

## Separating a video into layers

`separateVideoLayers()` produces two WebM files: an opaque **base** (background) and a **foreground** with a real alpha channel (the subject, matted out).

```ts
import { separateVideoLayers } from "@remotion/video-matting";

const file = new File([], "input.mp4"); // or a string/URL/Blob

const { base, foreground } = await separateVideoLayers({
  src: file,
  model: "modnet", // people-optimized, 25.9MB. Use "ben2-base" for general subjects (heavier, experimental).
  audio: "base", // "base" | "foreground" | "both" | "none"
  onModelLoadProgress: ({ progress }) => console.log("downloading model", progress),
  onProgress: ({ stage, progress }) => console.log(stage, progress),
});

const baseBlob = await base.getBlob();
const foregroundBlob = await foreground.getBlob();

// Release temporary storage once the blobs are retrieved.
await Promise.all([base.dispose(), foreground.dispose()]);
```

Run this as a pre-processing step (a browser page, a `<Player>`-embedded tool, or Remotion Studio) to produce the two WebM files, save them to `public/`, then reference the foreground with `<Video>`/`<OffthreadVideo>` in the composition — the same way as any other footage. Do not call `separateVideoLayers()` inside a component that renders every frame; it processes the whole clip once.

## Model download

The model (25.9MB for `modnet`, 219.1MB for `ben2-base`) is downloaded from `remotion.media` on first use and cached by the browser. Call `loadVideoMattingModel({model, onProgress})` ahead of time to show download progress, and `isVideoMattingModelCached({model})` to check whether it's already cached without downloading. `disposeVideoMattingModel()` frees the in-memory model; `removeVideoMattingModel()` also clears the persistent cache.

## Compositing the result

Place new content between the two layers so it appears to sit behind the subject and in front of the original background:

```tsx
<AbsoluteFill>
  <Video src={staticFile("base.webm")} />
  {/* inserted content goes here */}
  <Video src={staticFile("foreground.webm")} />
</AbsoluteFill>
```
