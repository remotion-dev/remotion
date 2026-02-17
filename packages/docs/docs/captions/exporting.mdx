---
image: /generated/articles-docs-captions-exporting.png
sidebar_label: Exporting
title: Exporting subtitles
crumb: Captions
---

# Exporting subtitles

This guide covers different ways to export subtitles from your Remotion video.

## Burned-in subtitles

If you want the subtitles to be part of the video itself (burned in), follow the instructions in [Displaying captions](/docs/captions/displaying) to render the captions, then simply [render the video](/docs/render) as usual.

```bash
npx remotion render
```

## Exporting as a separate .srt file

To export subtitles as a separate `.srt` file, use the [`<Artifact>`](/docs/artifact) component together with [`serializeSrt()`](/docs/captions/serialize-srt).

```tsx twoslash title="Exporting captions as .srt"
import {Artifact, useCurrentFrame} from 'remotion';
import {serializeSrt} from '@remotion/captions';
import type {Caption} from '@remotion/captions';

const captions: Caption[] = [
  {
    text: 'Hello ',
    startMs: 0,
    endMs: 500,
    timestampMs: 250,
    confidence: 1,
  },
  {
    text: 'world!',
    startMs: 500,
    endMs: 1000,
    timestampMs: 750,
    confidence: 1,
  },
];

// ---cut---

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();

  // Convert captions to SRT format
  // Each caption becomes its own line
  const srtContent = serializeSrt({
    lines: captions.map((caption) => [caption]),
  });

  return (
    <>
      {/* Only emit the artifact on the first frame */}
      {frame === 0 ? <Artifact filename="subtitles.srt" content={srtContent} /> : null}
      {/* Rest of your video content */}
    </>
  );
};
```

The artifact will be saved to `out/[composition-id]/subtitles.srt` when rendering.

### Grouping words into lines

If your captions are word-by-word, you may want to group multiple words into a single subtitle line. You can use [`createTikTokStyleCaptions()`](/docs/captions/create-tiktok-style-captions) to create pages, then convert them back to the format expected by `serializeSrt()`:

```tsx twoslash title="Grouping captions into lines"
import {serializeSrt, createTikTokStyleCaptions} from '@remotion/captions';
import type {Caption} from '@remotion/captions';

const captions: Caption[] = [];

// ---cut---

const {pages} = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 3000,
});

const srtContent = serializeSrt({
  lines: pages.map((page) => {
    // Convert page tokens back to Caption format
    return page.tokens.map((token) => ({
      text: token.text,
      startMs: token.fromMs,
      endMs: token.toMs,
      timestampMs: (token.fromMs + token.toMs) / 2,
      confidence: null,
    }));
  }),
});
```

## See also

- [Displaying captions](/docs/captions/displaying) - Render captions in your video
- [`<Artifact>`](/docs/artifact) - Emit files during rendering
- [`serializeSrt()`](/docs/captions/serialize-srt) - Convert captions to SRT format
- [Emitting Artifacts](/docs/artifacts) - Full guide on artifacts
