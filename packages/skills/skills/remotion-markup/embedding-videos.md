---
name: embedding-videos
description: Embedding videos in Remotion - trimming, volume, speed, looping, pitch
metadata:
  tags: video, media, trim, volume, speed, loop, pitch
---

# Using videos in Remotion

## Prerequisites

First, the @remotion/media package needs to be installed.  
If it is not, use the following command:

```bash
npx remotion add @remotion/media # If project uses npm
bunx remotion add @remotion/media # If project uses bun
yarn remotion add @remotion/media # If project uses yarn
pnpm exec remotion add @remotion/media # If project uses pnpm
```

Use `<Video>` from `@remotion/media` to embed videos into your composition.

```tsx
import { Video } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Video src={staticFile("video.mp4")} />;
};
```

Remote URLs are also supported:

```tsx
<Video src="https://remotion.media/video.mp4" />
```

## Trimming

Use `trimBefore` to skip the beginning of the video and `durationInFrames` to end it early. Values are in frames.

```tsx
const { fps } = useVideoConfig();

return (
  <Video
    src={staticFile("video.mp4")}
    trimBefore={2 * fps} // Skip the first 2 seconds
    durationInFrames={8 * fps} // Play 8 seconds, until the 10 second mark
  />
);
```

## Delaying

Set `from` directly on `<Video>` to delay when it appears:

```tsx
import { staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";

const { fps } = useVideoConfig();

return (
  <Video from={fps} src={staticFile("video.mp4")} />
);
```

The video will appear after 1 second.

## Sizing and Position

Use the `style` prop to control size and position:

```tsx
<Video
  src={staticFile("video.mp4")}
  style={{
    width: 500,
    height: 300,
    position: "absolute",
    top: 100,
    left: 50,
  }}
  objectFit="cover"
/>
```

## Volume

Set a static volume (0 to 1):

```tsx
<Video src={staticFile("video.mp4")} volume={0.5} />
```

Animate volume with `useCurrentFrame()` and pass the result of `interpolate()` directly to `volume`. Keep the keyframes inline so Studio can edit them:

```tsx
import { Video } from "@remotion/media";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

return (
  <Video
    src={staticFile("video.mp4")}
    volume={interpolate(frame, [0, 1 * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}
  />
);
```

With Studio interactivity enabled, these keyframes can be edited and are shown as a volume curve in the timeline.

`frame` is relative to the component that calls `useCurrentFrame()`: the composition frame at the root, or the local frame inside a `<Sequence>`. Setting `from` on `<Video>` does not reset this frame. For a video starting at `from={1 * fps}`, fade in with `interpolate(frame, [1 * fps, 2 * fps], [0, 1], {...})`.

`trimBefore` and `playbackRate` on the video change the source playback, but do not shift or scale these parent-timeline keyframes. When migrating a volume callback, start the keyframes at the media's first visible frame, where the callback frame started at 0. See [Timing and trimming](https://www.remotion.dev/docs/timing) for how enclosing timing affects `useCurrentFrame()`.

Use `muted` to silence the video entirely:

```tsx
<Video src={staticFile("video.mp4")} muted />
```

## Speed

Use `playbackRate` to change the playback speed:

```tsx
// 2x speed
<Video src={staticFile("video.mp4")} playbackRate={2} />
// Half speed
<Video src={staticFile("video.mp4")} playbackRate={0.5} />
```

Reverse playback is not supported.

## Looping

Use `loop` to loop the video indefinitely:

```tsx
<Video src={staticFile("video.mp4")} loop />
```

Volume keyframes based on the parent component's `frame` continue across media loops. A fade over multiple loops needs no `loopVolumeCurveBehavior`:

```tsx
import { Video } from "@remotion/media";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

return (
  <Video
    src={staticFile("video.mp4")}
    loop
    premountFor={fps}
    volume={interpolate(frame, [0, 10 * fps], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}
  />
);
```

To repeat the volume envelope each loop, put the component that calls `useCurrentFrame()` inside a looping `<Sequence>` or `<Loop>`. Match its loop duration to the media's played duration, accounting for trimming and playback speed. The media's own `loop` prop does not reset the parent's `frame`.

## Pitch

Use `toneFrequency` to adjust the pitch without affecting speed. Values range from 0.01 to 2:

```tsx
<Video
  src={staticFile("video.mp4")}
  toneFrequency={1.5} // Higher pitch
/>
<Video
  src={staticFile("video.mp4")}
  toneFrequency={0.8} // Lower pitch
/>
```

Pitch shifting only works during server-side rendering, not in the Remotion Studio preview or in the `<Player />`.
