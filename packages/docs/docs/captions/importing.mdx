---
image: /generated/articles-docs-captions-importing.png
sidebar_label: Importing from .srt
title: Importing .srt subtitles into Remotion
crumb: Captions
---

# Importing .srt subtitles into Remotion

If you have an existing `.srt` subtitle file, you can import it into Remotion using [`parseSrt()`](/docs/captions/parse-srt) from `@remotion/captions`.

## Reading an .srt file

Use [`staticFile()`](/docs/staticfile) to reference an `.srt` file in your `public` folder, then fetch and parse it:

```tsx twoslash title="Importing captions from .srt"
import {useState, useEffect, useCallback} from 'react';
import {AbsoluteFill, staticFile, useDelayRender} from 'remotion';
import {parseSrt} from '@remotion/captions';
import type {Caption} from '@remotion/captions';

export const MyComponent: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender());

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile('subtitles.srt'));
      const text = await response.text();
      const {captions: parsed} = parseSrt({input: text});
      setCaptions(parsed);
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

  return <AbsoluteFill>{/* Use captions here */}</AbsoluteFill>;
};
```

Alternatively, you can also `fetch()` a remote file via URL.

## Using imported captions

Once parsed, the captions are in the recommended [`Caption`](/docs/captions/caption) format and can be used with all `@remotion/captions` utilities.

Possible next steps:

- [Displaying captions](/docs/captions/displaying) - Render captions in your video
- [Exporting captions](/docs/captions/exporting) - Export captions to a file

## See also

- [`parseSrt()`](/docs/captions/parse-srt) - API reference
- [Displaying captions](/docs/captions/displaying) - Render captions in your video
- [`Caption`](/docs/captions/caption) - The caption data structure
