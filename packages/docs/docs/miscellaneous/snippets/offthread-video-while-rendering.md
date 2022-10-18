---
title: "<OffthreadVideo /> while rendering"
---

The following component will only use [`<OffthreadVideo />`](/docs/offthreadvideo) while rendering, but [`<Video />`](/docs/video) in the Player.
This is useful for attaching a `ref` to the [`<Video />`](/docs/video) tag.

`window.remotion_isPlayer` is used to determine if the environment is a Player, but this is not an official Remotion API that is guaranteed to be reliable. It's better if you define your own global variable `window.myApp_isPlayer = true` in your Webapp to declare that this is a Player environment.

```tsx twoslash
import { forwardRef } from "react";
import { OffthreadVideo, RemotionOffthreadVideoProps, Video } from "remotion";

const OffthreadWhileRenderingRefForwardingFunction: React.ForwardRefRenderFunction<
  HTMLVideoElement,
  RemotionOffthreadVideoProps
> = (props, ref) => {
  const { imageFormat, ...otherProps } = props;

  if (window.remotion_isPlayer) {
    return <Video ref={ref} {...otherProps}></Video>;
  }

  return <OffthreadVideo {...props}></OffthreadVideo>;
};

export const OffthreadVideoWhileRendering = forwardRef(
  OffthreadWhileRenderingRefForwardingFunction
);
```
