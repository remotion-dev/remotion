---
name: display-captions
description: Displaying captions in Remotion using the Basic Captions element
metadata:
  tags: captions, subtitles, display, element
---

# Displaying captions in Remotion

This guide explains how to display captions in Remotion, assuming you already have captions in the [`Caption`](https://www.remotion.dev/docs/captions/caption.md) format.

## Prerequisites

Read [Transcribing audio](transcribe-captions.md) for how to generate captions.

First, the [`@remotion/captions`](https://www.remotion.dev/docs/captions.md) package needs to be installed.
If it is not installed, use the following command:

```bash
npx remotion add @remotion/captions # If project uses npm
bunx remotion add @remotion/captions # If project uses bun
yarn remotion add @remotion/captions # If project uses yarn
pnpm exec remotion add @remotion/captions # If project uses pnpm
```

## Adding the Basic Captions element

Use the [Basic Captions](https://www.remotion.dev/elements/captions/basic-captions) element to display captions.

Alternatives are available at [Remotion Captions Elements](https://www.remotion.dev/elements/captions), but use Basic Captions unless there are more precise specifications.

Fetch its source code from https://www.remotion.dev/elements/captions/basic-captions.md and copy the `basic-captions.tsx` file into the project unchanged.

## Displaying captions alongside video content

Keep each clip's video and captions inside the same `<Sequence>`,
`<Series.Sequence>`, or `<TransitionSeries.Sequence>`. Put the clip's
`trimBefore`, `durationInFrames`, and `playbackRate` on that shared parent so
trimming or changing the speed affects both. For independently positioned
clips, put `from` on the shared `<Sequence>` too. Do not repeat the shared trim
or playback rate on the video or captions, which would apply it twice.

Keep caption timestamps in milliseconds relative to the original media file.
Do not add the clip's start time in the main composition or subtract its trim
from the caption data. The shared parent maps that source time to the edited
timeline. Give every captioned clip its own group and inline caption array;
do not combine captions from multiple clips into one overlay outside the
scene timeline. Moving, reordering, trimming, or deleting the group then
affects its video and captions together.

Putting captions inside a scene is insufficient if `trimBefore` or
`playbackRate` is still applied only to `<Video>`: its sibling captions do not
inherit those props. Apply them to the shared parent instead.

The Caption editor writes back to the array literal on the selected
`<BasicCaptions>` source node,
so inline the captions directly in its `captions` prop. Passing a variable or
component prop such as `captions={captions}` leaves no source array for the
editor to update. If the captions were transcribed to a JSON file, copy its
contents into the prop.

Give the caption area a width and position it over the video. In this
1920px-wide composition, the 900px caption area is centered by translating it
`(1920 - 900) / 2 = 510` pixels from the left:

```tsx
import { Video } from "@remotion/media";
import { Composition, Series, staticFile, useVideoConfig } from "remotion";
import { BasicCaptions } from "./basic-captions";

export const MyComposition: React.FC = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComponent}
      durationInFrames={750}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

export const MyComponent: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <Series>
      <Series.Sequence
        name="Opening"
        trimBefore={4 * fps}
        durationInFrames={20 * fps}
        premountFor={fps}
      >
        <Video
          name="Opening footage"
          src={staticFile("opening.mp4")}
          premountFor={fps}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
        <BasicCaptions
          name="Opening captions"
          premountFor={fps}
          width={900}
          style={{
            position: "absolute",
            bottom: 120,
            translate: "510px 0px",
          }}
          captions={[
            {
              text: "Hello",
              startMs: 5000,
              endMs: 5400,
              timestampMs: 5200,
              confidence: null,
            },
            {
              text: " world",
              startMs: 5400,
              endMs: 5900,
              timestampMs: 5650,
              confidence: null,
            },
          ]}
        />
      </Series.Sequence>
      <Series.Sequence
        name="Next clip"
        trimBefore={1 * fps}
        durationInFrames={5 * fps}
        premountFor={fps}
      >
        <Video
          name="Next footage"
          src={staticFile("next.mp4")}
          premountFor={fps}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
        <BasicCaptions
          name="Next captions"
          premountFor={fps}
          width={900}
          style={{
            position: "absolute",
            bottom: 120,
            translate: "510px 0px",
          }}
          captions={[
            {
              text: "Next",
              startMs: 2000,
              endMs: 2400,
              timestampMs: 2200,
              confidence: null,
            },
            {
              text: " clip",
              startMs: 2400,
              endMs: 2900,
              timestampMs: 2650,
              confidence: null,
            },
          ]}
        />
      </Series.Sequence>
    </Series>
  );
};
```

The opening skips four seconds of source footage, so its caption at `5000`
milliseconds appears one second into the scene. The next clip's timestamps
refer to `next.mp4`, not the main composition. Changing the opening's duration
moves the next clip and its captions together.

To change a captioned clip's speed, set `playbackRate` on its shared sequence.
`durationInFrames` selects a range of source frames; the group occupies
`durationInFrames / playbackRate` frames in its parent timeline. Update the
composition duration when changing the total timeline length.

If a caption has `pageBreakAfter: true`, the current page ends after that caption and the next caption starts a new page.

## White-space preservation

The captions are whitespace sensitive. You should include spaces in the `text` field before each word.
