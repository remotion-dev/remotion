---
id: use-video-texture
title: useVideoTexture()
---

Allows you to use a video in React Three Fiber that is synchronized with Remotion's `useCurrentFrame()`.

To use a video in a Three.JS context, you first have to render it and assign it a ref. If you only want to use it in a React Three Fiber Scene, you can make it invisible by adding a `{position: "absolute", opacity: 0}` style.

```tsx
import {useRef} from 'react';
import {Video} from 'remotion';
import src from './vid.mp4';

const MyVideo = () => {
  const videoRef = useRef<HTMLVideoElement>();
  return (
    <Video
      ref={videoRef}
      src={src}
      style={{position: "absolute", opacity: 0}}
    />
  );
}
```

To convert the video to a video texture, place the `useVideoTexture()` hook in the same component.

```tsx
import {useVideoTexture} from '@remotion/three';

// ...

const texture = useVideoTexture(videoRef)
```

The return type of it is a `THREE.VideoTexture | null` which you can assign as a `map` to for example `meshBasicMaterial`. We recommend to only render the material when the texture is not `null` to prevent bugs.

```tsx
  {videoTexture ? (
    <meshBasicMaterial map={videoTexture} />
  ) : null}
```

## See also

- [`<ThreeCanvas />`](/docs/three-canvas)
