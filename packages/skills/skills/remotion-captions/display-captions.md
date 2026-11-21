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

Fetch its source code from https://www.remotion.dev/elements/captions/basic-captions.md and save it as `basic-captions.element.tsx` in the project unchanged.

## One component per captioned source

To link captions together with a video source, make a new component with `Interactive.create()` and `layout: 'absolute-fill'`.

Reuse that exported component for every cut or repeat of the same source.

Then, cuts, speed-up, slow-downs, and trims can be achieved using by putting `from`, `trimBefore`, `durationInFrames`, and `playbackRate` on its instances.

Captions have only one source of truth, we don't need to duplicate if a clip is split.

And Captions remain editable in the Studio.

Example:

```tsx title="src/MyComposition.tsx"
import { Video } from "@remotion/media";
import { Interactive, Track, staticFile, useVideoConfig } from "remotion";
import { BasicCaptions } from "./basic-captions.element";

const InterviewInner: React.FC = () => {
  return (
    <>
      <Video
        name="Interview footage"
        src={staticFile("interview.mp4")}
        style={{ width: "100%", height: "100%" }}
      />
      <BasicCaptions
        name="Interview captions"
        width={900}
        style={{
          position: "absolute",
          bottom: 120,
          translate: "510px 0px",
        }}
        captions={[
          {
            text: "Hello",
            startMs: 2000,
            endMs: 3000,
            timestampMs: 2500,
            confidence: null,
          },
          {
            text: " world",
            startMs: 3000,
            endMs: 4000,
            timestampMs: 3500,
            confidence: null,
          },
          {
            text: " again",
            startMs: 4000,
            endMs: 5000,
            timestampMs: 4500,
            confidence: null,
          },
        ]}
      />
    </>
  );
};

export const Interview = Interactive.create({
  Component: InterviewInner,
  layout: "absolute-fill",
});

export const MyComposition: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <Track name="Interview clips">
      <Interview
        name="Opening"
        trimBefore={2 * fps}
        durationInFrames={3 * fps}
      />
      <Interview
        name="Faster repeat"
        from={3 * fps}
        trimBefore={2 * fps}
        durationInFrames={3 * fps}
        playbackRate={1.5}
      />
    </Track>
  );
};
```

```tsx title="src/Root.tsx"
import { Composition } from "remotion";
import { MyComposition } from "./MyComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
```

See also: [Timing props](../remotion-markup/timing-props.md)

## White-space preservation

The captions are whitespace sensitive. You should include spaces in the `text` field before each word.
