---
name: audio
description: Using audio and sound in Remotion - importing, trimming, volume, speed, pitch
metadata:
  tags: audio, media, trim, volume, speed, loop, pitch, mute, sound, sfx
---

# Using audio in Remotion

## Prerequisites

First, the @remotion/media package needs to be installed.
If it is not installed, use the following command:

```bash
npx remotion add @remotion/media
```

## Importing Audio

Use `<Audio>` from `@remotion/media` to add audio to your composition.

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Audio src={staticFile("audio.mp3")} />;
};
```

Remote URLs are also supported:

```tsx
import { Audio } from "@remotion/media";

<Audio src="https://remotion.media/audio.mp3" />
```

By default, audio plays from the start, at full volume and full length.
Multiple audio tracks can be layered by adding multiple `<Audio>` components.

## Trimming

Use `trimBefore` to skip the beginning of the audio and `durationInFrames` to end it early. Values are in frames.

```tsx
import { Audio } from "@remotion/media";

const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    trimBefore={2 * fps} // Skip the first 2 seconds
    durationInFrames={8 * fps} // Play 8 seconds, until the 10 second mark
  />
);
```

The audio still starts playing at the beginning of the composition - only the specified portion is played.

## Delaying

Set `from` directly on `<Audio>` to delay when it starts:

```tsx
import { staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";

const { fps } = useVideoConfig();

return (
  <Audio from={fps} src={staticFile("audio.mp3")} />
);
```

The audio will start playing after 1 second.

## Volume

Set a static volume (0 to 1):

```tsx
import { Audio } from "@remotion/media";

<Audio src={staticFile("audio.mp3")} volume={0.5} />
```

Animate volume with `useCurrentFrame()` and pass the result of `interpolate()` directly to `volume`. Keep the keyframes inline so Studio can edit them:

```tsx
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    volume={interpolate(frame, [0, 1 * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}
  />
);
```

With Studio interactivity enabled, these keyframes can be edited and are shown as a volume curve in the timeline.

`frame` is relative to the component that calls `useCurrentFrame()`: the composition frame at the root, or the local frame inside a `<Sequence>`. Setting `from` on `<Audio>` does not reset this frame. Offset the keyframes to match when the audio starts:

```tsx
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    from={1 * fps}
    premountFor={fps}
    volume={interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}
  />
);
```

This fades in during the first second of playback. `trimBefore` and `playbackRate` on the audio change the source playback, but do not shift or scale these parent-timeline keyframes. When migrating a volume callback, start the keyframes at the media's first visible frame, where the callback frame started at 0. See [Timing and trimming](https://www.remotion.dev/docs/timing) for how enclosing timing affects `useCurrentFrame()`.

## Muting

Use `muted` to silence the audio. It can be set dynamically:

```tsx
import { Audio } from "@remotion/media";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    muted={frame >= 2 * fps && frame <= 4 * fps} // Mute between 2s and 4s
  />
);
```

## Speed

Use `playbackRate` to change the playback speed:

```tsx
import { Audio } from "@remotion/media";

// 2x speed
<Audio src={staticFile("audio.mp3")} playbackRate={2} />
// Half speed
<Audio src={staticFile("audio.mp3")} playbackRate={0.5} />
```

Reverse playback is not supported.

## Looping

Use `loop` to loop the audio indefinitely:

```tsx
import { Audio } from "@remotion/media";

<Audio src={staticFile("audio.mp3")} loop premountFor={fps} />
```

Put `name`, `from`, `loop`, `volume`, and `premountFor` directly on `<Audio>`.

Volume keyframes based on the parent component's `frame` continue across media loops. A fade over multiple loops needs no `loopVolumeCurveBehavior`:

```tsx
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
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
import { Audio } from "@remotion/media";

<Audio
  src={staticFile("audio.mp3")}
  toneFrequency={1.5} // Higher pitch
/>
<Audio
  src={staticFile("audio.mp3")}
  toneFrequency={0.8} // Lower pitch
/>
```

Pitch shifting only works during server-side rendering, not in the Remotion Studio preview or in the `<Player />`.
