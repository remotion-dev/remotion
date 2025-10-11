---
image: /generated/articles-docs-webcodecs-convert-audiodata.png
id: convert-audiodata
title: convertAudioData()
slug: /webcodecs/convert-audiodata
crumb: '@remotion/webcodecs'
---

:::warning
[We are phasing out Remotion WebCodecs and are moving to Mediabunny](/blog/mediabunny)!
:::

# convertAudioData()<AvailableFrom v="4.0.288"/>

_Part of the [`@remotion/webcodecs`](/docs/webcodecs) package._

import {LicenseDisclaimer} from './LicenseDisclaimer';

<details>
  <summary>💼 Important License Disclaimer</summary>
  <LicenseDisclaimer />
</details>

Converts an [`AudioData`](https://developer.mozilla.org/en-US/docs/Web/API/AudioData) object to a new [`AudioData`](https://developer.mozilla.org/en-US/docs/Web/API/AudioData) object with a different sample rate or format, or both.

```tsx twoslash title="Converting an audio data"
import {convertAudioData} from '@remotion/webcodecs';

const audioData = new AudioData({
  data: new Int32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
  format: 's32',
  numberOfChannels: 1,
  numberOfFrames: 10,
  sampleRate: 44100,
  timestamp: 0,
});

const newAudioData = convertAudioData({audioData, newSampleRate: 22050});

/*
{
  data: [0, 2, 4, 6, 8],
  format: 's32',
  numberOfChannels: 1,
  numberOfFrames: 5,
  sampleRate: 22050,
  timestamp: 0,
}
*/
```

## Behavior

- Rounding may occur.
- The new sample rate must be between 3000 and 768000.
- If no conversion is needed (same sample rate and format), the original `AudioData` is cloned.
- No cleanup is done on either the input or output `AudioData` (call [`close()`](https://developer.mozilla.org/en-US/docs/Web/API/AudioData/close) on them yourself).

## API

Takes an object with the following properties:

### `audioData`

The [`AudioData`](https://developer.mozilla.org/en-US/docs/Web/API/AudioData) object to convert.

### `newSampleRate?`

The new sample rate. Must be between 3000 and 768000 (only Chrome enforces this technically, but Remotion will throw an error always).

### `newFormat?`

The new format.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/webcodecs/src/convert-audiodata.ts)
- [convertMedia()](/docs/webcodecs/convert-media)
