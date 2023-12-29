---
image: /generated/articles-docs-use-video-texture.png
id: use-offthread-video-texture
title: useOffthreadVideoTexture()
crumb: "@remotion/three"
---

Allows you to use a video in React Three Fiber that is synchronized with Remotion's `useCurrentFrame()`, simillar to [`useVideoTexture()`](/docs/use-video-texture), but during rendering extracts precise frames from a video during rendering and wraps them into a `THREE.ImageTexture.`

This hook was designed to combat limitations of the default `<Video>` element that is used with `useVideoTexture` hook.
See: [`<OffthreadVideo> vs <Video>`](/docs/video-vs-offthreadvideo)

Under the hood, uses `useVideoTexture()` in Remotion Studio and Remotion Player.

The return type of it is a `THREE.Texture | null` which you can assign as a `map` to for example `meshBasicMaterial`. We recommend to only render the material when the texture is not `null` to prevent bugs.

```tsx twoslash
import { ThreeCanvas, useOffthreadVideoTexture } from "@remotion/three";
import { staticFile, useVideoConfig } from "remotion";

const videoSrc = staticFile("/vid.mp4");

const My3dVideo = () => {
  const { width, height } = useVideoConfig();

  const videoTexture = useOffthreadVideoTexture({
    src: videoSrc,
    loop: false,
    transparent: false,
    playbackRate: 1,
  });

  return (
    <ThreeCanvas width={width} height={height}>
      <mesh>
        {videoTexture ? <meshBasicMaterial map={videoTexture} /> : null}
      </mesh>
    </ThreeCanvas>
  );
};
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/three/src/use-offthread-video-texture.ts)
- [`useVideoTexture()`](/docs/use-video-texture)
- [`<ThreeCanvas />`](/docs/three-canvas)
- [`<OffthreadVideo> vs <Video>`](/docs/video-vs-offthreadvideo)
