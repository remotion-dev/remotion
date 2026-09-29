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

Put the captions next to the video so they stay in sync. Inline the captions
directly in the `captions` prop; if they were transcribed to a JSON file, copy
its contents into the prop.

Give the caption area a width and position it over the video. In this
1920px-wide composition, the 900px caption area is centered by translating it
`(1920 - 900) / 2 = 510` pixels from the left:

```tsx
import { Video } from "@remotion/media";
import { Composition, staticFile } from "remotion";
import { BasicCaptions } from "./basic-captions";

export const MyComposition: React.FC = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComponent}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

export const MyComponent: React.FC = () => {
  return (
    <>
      <Video name="Camera footage" src={staticFile("video.mp4")} />
      <BasicCaptions
        width={900}
        style={{
          position: "absolute",
          bottom: 120,
          translate: "510px 0px",
        }}
        captions={[
          {
            text: "Hello",
            startMs: 0,
            endMs: 400,
            timestampMs: 200,
            confidence: null,
          },
          {
            text: " world",
            startMs: 400,
            endMs: 900,
            timestampMs: 650,
            confidence: null,
          },
        ]}
      />
    </>
  );
};
```

If a caption has `pageBreakAfter: true`, the current page ends after that caption and the next caption starts a new page.

## White-space preservation

The captions are whitespace sensitive. You should include spaces in the `text` field before each word.
