---
image: /generated/articles-docs-media-parser-seeking-hints.png
id: seeking-hints
title: Seeking Hints
slug: /media-parser/seeking-hints
crumb: '@remotion/media-parser'
---

:::warning
[We are phasing out Media Parser and are moving to Mediabunny](/blog/mediabunny)!
:::

:::warning
This feature is experimental and not yet ready for production use.
:::

When Media Parser wants to seek to a specific position in the media file, it can be expensive to find out where to go.

With Seeking Hints, you can provide a hint to the media parsing process upfront about the structure to the file, so that seeking can be short-circuited without needing to figure out the position.

Seeking hints are produced from previous [`parseMedia()`](/docs/media-parser/parse-media) calls.

To get seeking hints, you can call [`getSeekingHints()`](/docs/media-parser/media-parser-controller#getseekinghints) on the controller.

```tsx twoslash title="Getting seeking hints"
import {mediaParserController, parseMedia} from '@remotion/media-parser';

const controller = mediaParserController();

await parseMedia({
  controller,
  // Adding a callback so the full file is read
  onVideoTrack: (track) => {
    return (sample) => {
      console.log(sample);
    };
  },
  src: 'https://stream.mux.com/QkFQYWZ0ZS53ZWJ3aWQvc3RhdGlvbl9pbnRlcm5hbC5tM3U4Lm1wNA.m3u8',
});

const hints = await controller.getSeekingHints();
```

## Using seeking hints

Once you have obtained seeking hints from a previous parse, you can pass them to a new [`parseMedia()`](/docs/media-parser/parse-media), [`parseMediaOnWebWorker()`](/docs/media-parser/parse-media-on-web-worker), [`parseMediaOnServerWorker()`](/docs/media-parser/parse-media-on-server-worker), [`downloadAndParseMedia()`](/docs/media-parser/download-and-parse-media) or [`convertMedia()`](/docs/webcodecs/convert-media) call.

```tsx twoslash title="Using seeking hints from a previous parse"
import {parseMedia, mediaParserController} from '@remotion/media-parser';

const controller = mediaParserController();
const seekingHints = await controller.getSeekingHints();

// ---cut---

await parseMedia({
  controller,
  src: 'https://stream.mux.com/QkFQYWZ0ZS53ZWJ3aWQvc3RhdGlvbl9pbnRlcm5hbC5tM3U4Lm1wNA.m3u8',
  // Seeking hints were obtained from the previous parse
  seekingHints,
});
```

## Good to know

- Seeking hints can be fetched at any time also during the parsing process, not only at the end.
- The data structure of the seeking hints is not part of the public API and may change at any time.
- After the parse, seeking hints are only available if the parse was successful or aborted, not when it failed.
- Seeking hints are available for [`parseMediaOnWebWorker()`](/docs/media-parser/parse-media-on-web-worker) and [`parseMediaOnServerWorker()`](/docs/media-parser/parse-media-on-server-worker).
- A [`mediaParserController()`](/docs/media-parser/media-parser-controller) can only be attached to 1 [`parseMedia()`](/docs/media-parser/parse-media) call.
- Seeking hints can be passed to [`convertMedia()`](/docs/webcodecs/convert-media).
