---
name: transparent-videos
description: Rendering transparent videos in Remotion with VP8, VP9, or ProRes codecs
metadata:
  tags: transparent, alpha, codec, vp8, vp9, prores, webm, pixel-format
---

# Rendering Transparent Videos in Remotion

## What are transparent videos?

Transparent videos contain an alpha channel that allows parts of the video to be see-through, similar to PNG images with transparency. This is useful for overlaying videos on other content or creating videos with non-rectangular shapes.

**Browser support:** Chrome and Firefox support WebM videos (VP8/VP9) with alpha channels. Safari and other browsers do not support transparent WebM playback.

## Supported codecs

Only specific codecs support alpha channels:

### VP8 or VP9 (WebM)

Best for web playback in Chrome/Firefox:

```tsx
import {renderMedia} from '@remotion/renderer';

await renderMedia({
  composition,
  codec: 'vp9', // or 'vp8'
  imageFormat: 'png',
  pixelFormat: 'yuva420p',
  outputLocation: 'out/video-transparent.webm',
});
```

### ProRes (4444 or 4444-xq)

Best for video editing software (Final Cut Pro, Adobe Premiere, DaVinci Resolve):

```tsx
await renderMedia({
  composition,
  codec: 'prores',
  proresProfile: '4444', // or '4444-xq'
  imageFormat: 'png',
  pixelFormat: 'yuva444p10le',
  outputLocation: 'out/video-transparent.mov',
});
```

## Required settings

To render transparent videos, you **must** configure three settings:

1. **Image format:** `png` (JPEG doesn't support transparency)
2. **Codec:** `vp8`, `vp9`, or `prores`
3. **Pixel format:** 
   - `yuva420p` for VP8/VP9
   - `yuva444p10le` for ProRes

### Using remotion.config.ts

```tsx
import {Config} from '@remotion/cli/config';

// For WebM (VP8/VP9)
Config.setVideoImageFormat('png');
Config.setPixelFormat('yuva420p');
Config.setCodec('vp9');

// For ProRes
Config.setVideoImageFormat('png');
Config.setPixelFormat('yuva444p10le');
Config.setCodec('prores');
Config.setProResProfile('4444');
```

### Using CLI flags

```bash
# WebM
remotion render --image-format=png --pixel-format=yuva420p --codec=vp9 my-video out.webm

# ProRes
remotion render --image-format=png --pixel-format=yuva444p10le --codec=prores --prores-profile=4444 my-video out.mov
```

### Using calculateMetadata (recommended)

Set transparency as the default for a composition:

```tsx
import {CalculateMetadataFunction} from 'remotion';

const calculateMetadata: CalculateMetadataFunction<Props> = async ({props}) => {
  return {
    defaultCodec: 'vp9',
    props: {
      ...props,
      imageFormat: 'png',
      pixelFormat: 'yuva420p',
    },
  };
};

<Composition
  id="my-video"
  component={MyVideo}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
  calculateMetadata={calculateMetadata}
/>
```

## Transparent videos in your composition

Make sure your composition doesn't render an opaque background:

```tsx
export const MyVideo: React.FC<{transparent: boolean}> = ({transparent}) => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: transparent ? undefined : 'white',
      }}
    >
      {/* Your content */}
    </div>
  );
};
```

Use the **checkerboard button** in Remotion Studio to verify your video is transparent.

## Enabling transparency for <OffthreadVideo>

When using `<OffthreadVideo>` in your composition, add the `transparent` prop:

```tsx
import {OffthreadVideo} from 'remotion';

<OffthreadVideo
  src={staticFile('video.webm')}
  transparent // Required for alpha channel during export
/>
```

Without this prop, the video will be rendered as opaque even if it has an alpha channel.

## Common pitfalls

### ❌ H.264 does NOT support transparency

```tsx
// This will NOT work - H.264 doesn't support alpha
codec: 'h264',
pixelFormat: 'yuva420p', // Ignored
```

You must use VP8, VP9, or ProRes.

### ❌ Wrong pixel format

```tsx
// Wrong for VP9
codec: 'vp9',
pixelFormat: 'yuv420p', // Missing 'a' for alpha

// Wrong for ProRes
codec: 'prores',
pixelFormat: 'yuva420p', // Should be yuva444p10le
```

### ❌ Forgetting image format

```tsx
// Won't work - JPEG doesn't support transparency
imageFormat: 'jpeg',
codec: 'vp9',
pixelFormat: 'yuva420p',
```

Must use `imageFormat: 'png'`.

### ❌ Opaque background in composition

```tsx
// This will render a white background
<div style={{backgroundColor: 'white'}}>
  {/* Content */}
</div>
```

Remove or conditionally set the background color.

## Browser limitations

- **Chrome/Firefox:** Full support for WebM with alpha
- **Safari/Edge:** No support for transparent WebM playback
- **All browsers:** Can play transparent videos in `<video>` tags, but may not render transparency

Consider creating fallback versions:

```json
"scripts": {
  "render": "remotion render my-video video.mp4",
  "render-transparent": "remotion render --image-format=png --pixel-format=yuva420p --codec=vp9 my-video video-transparent.webm"
}
```

Use `<source>` elements or the `canplay` event to serve the appropriate version based on browser support.

## See also

- [Transparent videos documentation](https://www.remotion.dev/docs/transparent-videos)
- [renderMedia API](https://www.remotion.dev/docs/renderer/render-media)
- [CLI options](https://www.remotion.dev/docs/cli)
