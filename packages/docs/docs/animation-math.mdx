---
image: /generated/articles-docs-animation-math.png
title: Animation math
crumb: "Techniques"
---

You can add, subtract and multiply animation values to create more complex animations.  
Consider the following example:

```tsx twoslash title="Enter and exit"
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps, durationInFrames } = useVideoConfig();

const enter = spring({
  fps,
  frame,
  config: {
    damping: 200,
  },
});

const exit = spring({
  fps,
  config: {
    damping: 200,
  },
  durationInFrames: 20,
  delay: durationInFrames - 20,
  frame,
});

const scale = enter - exit;
```

- At the beginning of the animation, the value of `enter` is `0`, it goes to `1` over the course of the animation.
- Before the sequence ends, we create an `exit` animation that goes from `0` to `1`.
- Subtracting the `exit` animation from the `enter` animation gives us the overall state of the animation which we use to animate `scale`.

<Demo type="animation-math" />

```tsx twoslash title="Full snippet"
import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const AnimationMath: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });

  const exit = spring({
    fps,
    config: {
      damping: 200,
    },
    durationInFrames: 20,
    delay: durationInFrames - 20,
    frame,
  });

  const scale = enter - exit;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          height: 100,
          width: 100,
          backgroundColor: "#4290f5",
          borderRadius: 20,
          transform: `scale(${scale})`,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          fontSize: 50,
          color: "white",
        }}
      >
        {frame}
      </div>
    </AbsoluteFill>
  );
};
```
