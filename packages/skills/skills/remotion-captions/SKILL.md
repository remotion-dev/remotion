---
name: remotion-captions
description: Dealing with captions in Remotion
metadata:
  tags: subtitles, captions, remotion, json
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
};
```

## Generating captions

To transcribe video and audio files to generate captions, load the [rules/transcribe-captions.md](rules/transcribe-captions.md) file for more instructions.

## Displaying captions

To display captions in your video, load the [rules/display-captions.md](rules/display-captions.md) file for more instructions.

## Importing captions

To import captions from a .srt file, load the [rules/import-srt-captions.md](rules/import-srt-captions.md) file for more instructions.
