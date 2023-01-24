---
image: /generated/articles-docs-miscellaneous-snippets-offthread-video-while-rendering.png
title: "<OffthreadVideo /> while rendering"
crumb: "Snippets"
---

The following component will only use [`<OffthreadVideo />`](/docs/offthreadvideo) while rendering, but [`<Video />`](/docs/video) in the Player.
This is useful for attaching a `ref` to the [`<Video />`](/docs/video) tag.

`Experimental.useIsPlayer()` is used to determine if the environment is a Player. Note that this is not an official Remotion API yet that is guaranteed to be stable across patch versions.

```tsx twoslash
import { forwardRef } from "react";
import {
  Experimental,
  OffthreadVideo,
  RemotionOffthreadVideoProps,
  Video,
} from "remotion";

const OffthreadWhileRenderingRefForwardingFunction: React.ForwardRefRenderFunction<
  HTMLVideoElement,
  RemotionOffthreadVideoProps
> = (props, ref) => {
  const { imageFormat, ...otherProps } = props;
  const isPlayer = Experimental.useIsPlayer();

  if (isPlayer) {
    return <Video ref={ref} {...otherProps}></Video>;
  }

  return <OffthreadVideo {...props}></OffthreadVideo>;
};

export const OffthreadVideoWhileRendering = forwardRef(
  OffthreadWhileRenderingRefForwardingFunction
);
```
