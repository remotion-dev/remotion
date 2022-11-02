---
title: Accelerated Video
---

import {AcceleratedVideoExample} from "../../../components/AcceleratedVideoPlayerExample.tsx"

Say we're rendering the 500th frame, and we want to make this process a declarative one, by taking note of the speed with which the previous frames have been played before the current one.

We need a way to calculate the total time elapsed by the video, by adding the playback rates of the previous frames &mdash; in a recuring pattern hence increasing the speed of each frame when we loop over the total amount of frames we have, such that the speed function becomes;

```tsx
const speedFunction(f: number) => {
   interpolate(f, [0, 500], [1, 5], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
   })
}
```

## snippet example

Accelerating the playback or speed of a video with spring animation over time can be done with the example snippet below. You can also tweak the results with the player.

```tsx
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  Video,
} from "remotion";

const remapSpeed = ({
  frame,
  speed,
}: {
  frame: number;
  speed: (fr: number) => number;
}) => {
  let framesPassed = 0;
  for (let i = 0; i <= frame; i++) {
    framesPassed += speed(i);
  }

  return framesPassed;
};

export const AcceleratedVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const speedFunction = (f: number) =>
    interpolate(f, [0, 500], [1, 5], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const remappedFrame = remapSpeed({
    frame,
    speed: speedFunction,
  });

  return (
    <AbsoluteFill>
      <Sequence from={frame}>
        <Video
          startFrom={Math.round(remappedFrame)}
          playbackRate={speedFunction(frame)}
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
```

## Demo

Play the video, then tweak the parameters below the video.

<AcceleratedVideoExample />
