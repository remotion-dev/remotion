---
image: /generated/articles-docs-videos-as-threejs-texture.png
title: Using a video as a texture in Three.js
crumb: 'Videos'
sidebar_label: As Three.js texture
---

If you want to embed a video as a texture in Three.js, you have multiple options.

## Using `@remotion/media`<AvailableFrom v="4.0.387" />

We recommend that you mount a [`<Video>`](/docs/media/video) tag in [`headless`](/docs/media/video#headless) mode and use the [`onVideoFrame`](/docs/media/video#onvideoframe) prop to update the Three.js texture whenever a new frame is being drawn.

```tsx twoslash title="VideoTexture.tsx"
import {useThree} from '@react-three/fiber';
import {Video} from '@remotion/media';
import {ThreeCanvas} from '@remotion/three';
import React, {useCallback, useState} from 'react';
import {useRemotionEnvironment, useVideoConfig} from 'remotion';
import {CanvasTexture} from 'three';

const videoSrc = 'https://remotion.media/video.mp4';

const videoWidth = 1920;
const videoHeight = 1080;
const aspectRatio = videoWidth / videoHeight;
const scale = 3;
const planeHeight = scale;
const planeWidth = aspectRatio * scale;

const Inner: React.FC = () => {
  const [canvasStuff] = useState(() => {
    const canvas = new OffscreenCanvas(videoWidth, videoHeight);
    const context = canvas.getContext('2d')!;
    const texture = new CanvasTexture(canvas);
    return {canvas, context, texture};
  });

  const {invalidate, advance} = useThree();
  const {isRendering} = useRemotionEnvironment();

  const onVideoFrame = useCallback(
    (frame: CanvasImageSource) => {
      canvasStuff.context.drawImage(frame, 0, 0, videoWidth, videoHeight);
      canvasStuff.texture.needsUpdate = true;
      if (isRendering) {
        // ThreeCanvas's ManualFrameRenderer already calls advance() in a
        // useEffect on frame change, but video frame extraction is async
        // (BroadcastChannel round-trip) and resolves after that useEffect.
        // So by the time onVideoFrame fires, the scene was already rendered
        // with the stale texture. We need a second advance() here to
        // re-render the scene now that the texture is actually updated.
        advance(performance.now());
      } else {
        // During preview with the default frameloop='always', the texture
        // is picked up automatically. This is only needed if
        // frameloop='demand' is passed to <ThreeCanvas>.
        invalidate();
      }
    },
    [canvasStuff.context, canvasStuff.texture, invalidate, advance, isRendering],
  );

  return (
    <>
      <Video src={videoSrc} onVideoFrame={onVideoFrame} muted headless />
      <mesh>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial color={0xffffff} toneMapped={false} map={canvasStuff.texture} />
      </mesh>
    </>
  );
};

export const RemotionMediaVideoTexture: React.FC = () => {
  const {width, height} = useVideoConfig();

  return (
    <ThreeCanvas style={{backgroundColor: 'white'}} linear width={width} height={height}>
      <Inner />
    </ThreeCanvas>
  );
};
```

### Notes

- By using the [`headless`](/docs/media/video#headless) prop, nothing will be returned by the `<Video>` tag, so it can be mounted within a [`<ThreeCanvas>`](/docs/three-canvas) without affecting the rendering.
- During rendering, [`<ThreeCanvas>`](/docs/three-canvas) sets `frameloop='never'`, which means the scene is only re-rendered on demand. Use `advance()` inside `onVideoFrame` to synchronously re-render the scene before the screenshot is taken. Using `invalidate()` would only schedule an asynchronous re-render, which can lead to stale frames — especially with concurrency greater than 1.
- During preview, `invalidate()` is sufficient because the frame loop runs continuously.

## Examples

- Look at the source code of the [React Three Fiber template](/templates/three) for a practical example.
- The above example can be found in the [Remotion testbed](https://github.com/remotion-dev/remotion/tree/main/packages/example/src/VideoTexture.tsx).

## Using `<OffthreadVideo>`

_deprecated in favor of using `@remotion/media`_

You can use the [`useOffthreadVideoTexture()`](/docs/use-offthread-video-texture) hook from [`@remotion/three`](/docs/three-canvas) to get a texture from a video.

**Drawbacks:**

- It requires the whole video to be downloaded to disk first before frames can be extracted
- It does not work in [client-side rendering](/docs/client-side-rendering)
- It creates a new texture for each frame, which is less efficient than using `@remotion/media`

This API is therefore **deprecated** in favor of using the recommended approach mentioned above.

## Using `<Html5Video>`

_deprecated in favor of using `@remotion/media`_

You can use the [`useVideoTexture()`](/docs/use-video-texture) hook from [`@remotion/three`](/docs/three-canvas) to get a texture from a video.

It has all the drawbacks of the [`<Html5Video>`](/docs/video-tags) tag and is therefore **deprecated** in favor of using the recommended approach mentioned above.

## See also

- [`@remotion/three`](/docs/three)
- [React Three Fiber template](/templates/three)
- [Comparison of video tags](/docs/video-tags)
- [`<Video>`→ `headless` prop](/docs/media/video)
