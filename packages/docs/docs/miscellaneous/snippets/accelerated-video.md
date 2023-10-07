---
image: /generated/articles-docs-miscellaneous-snippets-accelerated-video.png
title: "Change the speed of a video over time"
crumb: "Snippets"
---

import {AcceleratedVideoExample} from "../../../components/AcceleratedVideoPlayerExample.tsx"

To speed up a video over time - for example to start with regular speed and then increasingly make it faster - we need to write some code to ensure we stay within Remotion's rules.

It is not as easy as interpolating the [`playbackRate`](/docs/video#playbackrate):

```tsx twoslash title="❌ Does not work"
import { interpolate, Video } from "remotion";
let frame = 0;
// ---cut---
<Video playbackRate={interpolate(frame, [0, 100], [1, 5])} />;
```

This is because Remotion will evaluate each frame independently from the other frames. If `frame` is 100, the `playbackRate` evaluates as 5 and Remotion will render the 500th frame of the video, which is undesired because it does not take into account that the speed has been building up to 5 until now.

The correct way is to calculate the total time that has elapsed until the current frame, by accumulating the playback rates of the previous frames. Then we start the video from that frame and set the playback rate of that current frame to ensure the video plays smoothly.

```tsx twoslash title="✅ AcceleratedVideo.tsx"
import React from "react";
import { interpolate, Sequence, useCurrentFrame, Video } from "remotion";

const remapSpeed = (frame: number, speed: (fr: number) => number) => {
  let framesPassed = 0;
  for (let i = 0; i <= frame; i++) {
    framesPassed += speed(i);
  }

  return framesPassed;
};

export const AcceleratedVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const speedFunction = (f: number) => interpolate(f, [0, 500], [1, 5]);

  const remappedFrame = remapSpeed(frame, speedFunction);

  return (
    <Sequence from={frame}>
      <Video
        startFrom={Math.round(remappedFrame)}
        playbackRate={speedFunction(frame)}
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      />
    </Sequence>
  );
};
```

Note that the timeline in the Remotion Studio might move as you play the video because we reposition the sequence over time. This is okay as long as we calculate the frame in an idempotent way.

## Demo

<AcceleratedVideoExample />

## See also

- [`<Video>`](/docs/video)
