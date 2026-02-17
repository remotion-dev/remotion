---
image: /generated/articles-docs-webcodecs-can-reencode-audio-track.png
id: can-reencode-audio-track
title: canReencodeAudioTrack()
slug: /webcodecs/can-reencode-audio-track
crumb: '@remotion/webcodecs'
---

:::warning
[We are phasing out Remotion WebCodecs and are moving to Mediabunny](/blog/mediabunny)!
:::

_Part of the [`@remotion/webcodecs`](/docs/webcodecs) package._

:::warning
**Unstable API**: This package is experimental. We might change the API at any time, until we remove this notice.
:::

Given an `AudioTrack`, determine if it can be re-encoded to another track.

You can obtain an `AudioTrack` using [`parseMedia()`](/docs/media-parser/parse-media) or during the conversion process using the [`onAudioTrack`](/docs/webcodecs/convert-media#onaudiotrack) callback of [`convertMedia()`](/docs/webcodecs/convert-media).

## Examples

```tsx twoslash title="Check if audio tracks can be re-encoded to Opus"
import {parseMedia} from '@remotion/media-parser';
import {canReencodeAudioTrack} from '@remotion/webcodecs';

const {tracks} = await parseMedia({
  src: 'https://remotion.media/BigBuckBunny.mp4',
  fields: {
    tracks: true,
  },
});

const audioTracks = tracks.filter((t) => t.type === 'audio');

for (const track of audioTracks) {
  await canReencodeAudioTrack({
    track,
    audioCodec: 'opus',
    bitrate: 128000,
    sampleRate: null,
  });
}
```

```tsx twoslash title="Convert an audio track to Opus, otherwise drop it"
import {convertMedia, canReencodeAudioTrack} from '@remotion/webcodecs';

await convertMedia({
  src: 'https://remotion.media/BigBuckBunny.mp4',
  container: 'webm',
  videoCodec: 'vp8',
  audioCodec: 'opus',
  onAudioTrack: async ({track}) => {
    const canReencode = await canReencodeAudioTrack({
      track,
      audioCodec: 'opus',
      bitrate: 128000,
      sampleRate: null,
    });

    if (canReencode) {
      return {type: 'reencode', audioCodec: 'opus', bitrate: 128000, sampleRate: null};
    }

    return {type: 'drop'};
  },
});
```

## API

### `track`

A `AudioTrack` object.

### `audioCodec`

_string_ <TsType type="ConvertMediaAudioCodec" source="@remotion/webcodecs" />

### `bitrate`

_number_

The bitrate with which you'd like to re-encode the audio track.

### `sampleRate`

_number | null_

The sample rate with which you'd like to re-encode the audio track. If the sampleRate is `null`, the sample rate of the original track will be used.

## Return value

Returns a `Promise<boolean>`.

## See also

- [Source code for this function on GitHub](https://github.com/remotion-dev/remotion/blob/main/packages/webcodecs/src/can-reencode-audio-track.ts)
- [`canReencodeVideoTrack()`](/docs/webcodecs/can-reencode-video-track)
- [`convertMedia()`](/docs/webcodecs/convert-media)
- [`parseMedia()`](/docs/media-parser/parse-media)
