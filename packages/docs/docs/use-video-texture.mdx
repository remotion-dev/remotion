---
image: /generated/articles-docs-use-video-texture.png
id: use-video-texture
title: useVideoTexture()
crumb: "@remotion/three"
---

Allows you to use a video in React Three Fiber that is synchronized with Remotion's `useCurrentFrame()`.

To use a video in a Three.JS context, you first have to render it and assign it a ref. If you only want to use it in a React Three Fiber Scene, you can make it invisible by adding a `{position: "absolute", opacity: 0}` style.

```tsx twoslash
import { useRef } from "react";
import { Video } from "remotion";
import src from "./vid.mp4";

const MyVideo = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <Video
      ref={videoRef}
      src={src}
      style={{ position: "absolute", opacity: 0 }}
    />
  );
};
```

To convert the video to a video texture, place the `useVideoTexture()` hook in the same component.

```tsx twoslash
const videoRef: React.MutableRefObject<HTMLVideoElement | null> =
  React.useRef(null);
// ---cut---
import { useVideoTexture } from "@remotion/three";

// ...

const texture = useVideoTexture(videoRef);
```

The return type of it is a `THREE.VideoTexture | null` which you can assign as a `map` to for example `meshBasicMaterial`. We recommend to only render the material when the texture is not `null` to prevent bugs.

```tsx twoslash
import { useVideoTexture } from "@remotion/three";
const videoRef: React.MutableRefObject<HTMLVideoElement | null> =
  React.useRef(null);
const videoTexture = useVideoTexture(videoRef);
// ---cut---
{
  videoTexture ? <meshBasicMaterial map={videoTexture} /> : null;
}
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/three/src/use-video-texture.ts)
- [Example usage: React Three Fiber template](/templates/three)
- [`<ThreeCanvas />`](/docs/three-canvas)
