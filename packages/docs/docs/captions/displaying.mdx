---
image: /generated/articles-docs-captions-displaying.png
sidebar_label: Displaying
title: Displaying captions
crumb: Captions
---

# Displaying captions

This guide explains how to display captions in Remotion, assuming you already have captions in the [`Caption`](/docs/captions/caption) format - see [Transcribing audio](/docs/captions/transcribing) for how to generate them.

## Fetching captions

First, fetch your captions JSON file. Use [`useDelayRender()`](/docs/use-delay-render) to hold the render until the captions are loaded:

```tsx twoslash title="Fetching captions"
import {useState, useEffect, useCallback} from 'react';
import {AbsoluteFill, staticFile, useDelayRender} from 'remotion';
import type {Caption} from '@remotion/captions';

export const MyComponent: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender());

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile('captions.json'));
      const data = await response.json();
      setCaptions(data);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  if (!captions) {
    return null;
  }

  return <AbsoluteFill>{/* Render captions here */}</AbsoluteFill>;
};
```

## Creating pages

Use [`createTikTokStyleCaptions()`](/docs/captions/create-tiktok-style-captions) to group captions into pages. The `combineTokensWithinMilliseconds` option controls how many words appear at once:

```tsx twoslash title="Creating caption pages"
import {useMemo} from 'react';
import {createTikTokStyleCaptions} from '@remotion/captions';
import type {Caption} from '@remotion/captions';

// How often captions should switch (in milliseconds)
// Higher values = more words per page
// Lower values = fewer words (more word-by-word)
const SWITCH_CAPTIONS_EVERY_MS = 1200;

const captions: Caption[] = [];

// ---cut---

const {pages} = useMemo(() => {
  return createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
  });
}, [captions]);
```

## Rendering with Sequences

Map over the pages and render each one in a [`<Sequence>`](/docs/sequence). Calculate the start frame and duration from the page timing:

```tsx twoslash title="Rendering caption pages"
import {Sequence, useVideoConfig, AbsoluteFill} from 'remotion';
import type {TikTokPage} from '@remotion/captions';

const SWITCH_CAPTIONS_EVERY_MS = 1200;

const pages: TikTokPage[] = [];

const CaptionPage: React.FC<{page: TikTokPage}> = ({page}) => <div>{page.text}</div>;

// ---cut---

const CaptionedContent: React.FC = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = (page.startMs / 1000) * fps;
        const endFrame = Math.min(nextPage ? (nextPage.startMs / 1000) * fps : Infinity, startFrame + (SWITCH_CAPTIONS_EVERY_MS / 1000) * fps);
        const durationInFrames = endFrame - startFrame;

        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationInFrames}>
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
```

## Rendering a caption page

A caption page contains `tokens` which you can use to highlight the currently spoken word. Here's an example that highlights words as they are spoken:

```tsx twoslash title="Rendering a caption page with word highlighting"
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TikTokPage} from '@remotion/captions';

const HIGHLIGHT_COLOR = '#39E508';

const CaptionPage: React.FC<{page: TikTokPage}> = ({page}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Current time relative to the start of the sequence
  const currentTimeMs = (frame / fps) * 1000;
  // Convert to absolute time by adding the page start
  const absoluteTimeMs = page.startMs + currentTimeMs;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: 80,
          fontWeight: 'bold',
          textAlign: 'center',
          // Preserve whitespace in captions
          whiteSpace: 'pre',
        }}
      >
        {page.tokens.map((token) => {
          const isActive = token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;

          return (
            <span
              key={token.fromMs}
              style={{
                color: isActive ? HIGHLIGHT_COLOR : 'white',
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

## Full example

<details>
<summary>Show full example</summary>

```tsx twoslash title="Full captioned video example"
import {useState, useEffect, useCallback, useMemo} from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useDelayRender, useVideoConfig} from 'remotion';
import {createTikTokStyleCaptions} from '@remotion/captions';
import type {Caption, TikTokPage} from '@remotion/captions';

const SWITCH_CAPTIONS_EVERY_MS = 1200;
const HIGHLIGHT_COLOR = '#39E508';

const CaptionPage: React.FC<{page: TikTokPage}> = ({page}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;
  const absoluteTimeMs = page.startMs + currentTimeMs;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: 80,
          fontWeight: 'bold',
          textAlign: 'center',
          whiteSpace: 'pre',
        }}
      >
        {page.tokens.map((token) => {
          const isActive = token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;

          return (
            <span
              key={token.fromMs}
              style={{
                color: isActive ? HIGHLIGHT_COLOR : 'white',
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const CaptionedVideo: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender());
  const {fps} = useVideoConfig();

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile('captions.json'));
      const data = await response.json();
      setCaptions(data);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  const {pages} = useMemo(() => {
    return createTikTokStyleCaptions({
      captions: captions ?? [],
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
    });
  }, [captions]);

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = (page.startMs / 1000) * fps;
        const endFrame = Math.min(nextPage ? (nextPage.startMs / 1000) * fps : Infinity, startFrame + (SWITCH_CAPTIONS_EVERY_MS / 1000) * fps);
        const durationInFrames = endFrame - startFrame;

        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationInFrames}>
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
```

</details>

## Next steps

You can customize the appearance of your captions:

- Use [`fitText()`](/docs/layout-utils/fit-text) from `@remotion/layout-utils` to automatically scale text to fit the video width
- [Add animations](/docs/animating-properties) for enter/exit effects
- Apply CSS text stroke for better visibility:

```tsx
<div
  style={{
    WebkitTextStroke: '4px black',
    paintOrder: 'stroke',
  }}
>
  {text}
</div>
```

## See also

- [Transcribing audio](/docs/captions/transcribing) - Generate captions from audio
- [`Caption`](/docs/captions/caption) - The caption data structure
- [`createTikTokStyleCaptions()`](/docs/captions/create-tiktok-style-captions) - API reference
- [`<Sequence>`](/docs/sequence) - Sequence component reference
