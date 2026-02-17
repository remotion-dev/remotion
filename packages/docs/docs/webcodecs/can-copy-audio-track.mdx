---
image: /generated/articles-docs-webcodecs-can-copy-audio-track.png
id: can-copy-audio-track
title: canCopyAudioTrack()
slug: /webcodecs/can-copy-audio-track
crumb: '@remotion/webcodecs'
---

:::warning
[We are phasing out Remotion WebCodecs and are moving to Mediabunny](/blog/mediabunny)!
:::

_Part of the [`@remotion/webcodecs`](/docs/webcodecs) package._

:::warning
**Unstable API**: This package is experimental. We might change the API at any time, until we remove this notice.
:::

Given an `AudioTrack`, determine if it can be copied to the output without re-encoding.

You can obtain an `AudioTrack` using [`parseMedia()`](/docs/media-parser/parse-media) or during the conversion process using the [`onAudioTrack`](/docs/webcodecs/convert-media#onaudiotrack) callback of [`convertMedia()`](/docs/webcodecs/convert-media).

## Examples

```tsx twoslash title="Check if an audio track can be copied"
import {parseMedia} from '@remotion/media-parser';
import {canCopyAudioTrack} from '@remotion/webcodecs';

const {tracks, container} = await parseMedia({
  src: 'https://remotion.media/BigBuckBunny.mp4',
  fields: {
    tracks: true,
    container: true,
  },
});

const audioTracks = tracks.filter((t) => t.type === 'audio');

for (const track of audioTracks) {
  canCopyAudioTrack({
    inputCodec: track.codecEnum,
    outputContainer: 'webm',
    inputContainer: container,
    outputAudioCodec: null,
  }); // bool
}
```

```tsx twoslash title="Copy an audio track to Opus, otherwise drop it"
import {convertMedia, canCopyAudioTrack} from '@remotion/webcodecs';

await convertMedia({
  src: 'https://remotion.media/BigBuckBunny.mp4',
  container: 'webm',
  videoCodec: 'vp8',
  audioCodec: 'opus',
  onAudioTrack: async ({track, outputContainer, inputContainer}) => {
    const canCopy = canCopyAudioTrack({
      inputCodec: track.codecEnum,
      outputContainer,
      inputContainer,
      outputAudioCodec: null,
    });

    if (canCopy) {
      return {type: 'copy'};
    }

    // Just to keep the example brief, in reality, you would re-encode the track here
    return {type: 'drop'};
  },
});
```

## API

### `inputCodec`

_string_ <TsType type="MediaParserAudioCodec" source="@remotion/media-parser" />

The codec of the input audio track.

### `inputContainer`

_string_ <TsType type="MediaParserContainer" source="@remotion/media-parser" />

The container format of the input media.

### `outputContainer`

_string_ <TsType type="ConvertMediaContainer" source="@remotion/webcodecs" />

The container format of the output media.

### `outputAudioCodec`

_string | null_ <TsType type="ConvertMediaAudioCodec" source="@remotion/webcodecs" />

The desired audio codec of the output media. If `null`, it means you don't care about the audio codec as long as it can be copied.

## Return value

Returns a `boolean`.

## See also

- [Source code for this function on GitHub](https://github.com/remotion-dev/remotion/blob/main/packages/webcodecs/src/can-copy-audio-track.ts)
- [`canCopyVideoTrack()`](/docs/webcodecs/can-copy-video-track)
- [`canReencodeAudioTrack()`](/docs/webcodecs/can-reencode-audio-track)
- [`convertMedia()`](/docs/webcodecs/convert-media)
