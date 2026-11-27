---
name: remotion-captions
description: Generate captions from audio or video, import subtitles, and display or animate captions in Remotion. Use before choosing a transcription package.
version: 4.0.547
---

All captions must be processed in JSON. The captions must use the [`Caption`](https://www.remotion.dev/docs/captions/caption.md) type which is the following:

```ts
import type { Caption } from "@remotion/captions";
```

This is the definition:

```ts
type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
  pageBreakAfter?: boolean;
};
```

## Generating captions

To generate captions from video or audio, read [Transcribing audio](transcribe-captions.md) before installing any transcription packages.

## Displaying captions

To display captions in your video, load the [display-captions.md](display-captions.md) file for more instructions.

## Importing captions

To import captions from a .srt file, load the [import-srt-captions.md](import-srt-captions.md) file for more instructions.

## Post-creation

After you're done, load this skill: [Remotion Best Practices](../remotion-best-practices/SKILL.md)

If not already done, open the Remotion Studio, unless instructed otherwise.
