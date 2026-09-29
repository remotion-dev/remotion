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

## Inlining captions

Inline the captions directly in the `captions` prop. Do not fetch them from a JSON file.  
If the captions were transcribed to a JSON file, copy its contents into the prop:

```tsx
import { BasicCaptions } from "./basic-captions";

export const MyComponent: React.FC = () => {
  return (
    <>
      <BasicCaptions
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

## Display captions alongside video content

By default, put the captions alongside the video content, so the captions are in sync.  
Transcribe each video separately and inline its captions next to it.

```tsx
<AbsoluteFill>
  <Video src={staticFile("video123.mp4")} />
  <BasicCaptions
    captions={[
      {
        text: "Hello",
        startMs: 0,
        endMs: 400,
        timestampMs: 200,
        confidence: null,
      },
    ]}
  />
</AbsoluteFill>
```
