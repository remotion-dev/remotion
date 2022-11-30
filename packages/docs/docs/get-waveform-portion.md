---
image: /generated/articles-docs-get-waveform-portion.png
title: getWaveformPortion()
id: get-waveform-portion
crumb: "@remotion/media-utils"
---

_Part of the `@remotion/media-utils` package of helper functions._

Takes bulky waveform data (for example fetched by [`getAudioData()`](/docs/get-audio-data)) and returns a trimmed and simplified version of it, for simpler visualization. This function is suitable if you only need volume data, if you need more detailed data about each frequency range, use [`visualizeAudio()`](/docs/visualize-audio).

## Arguments

### `options`

An object with the following arguments:

- `audioData`: `AudioData` - information about the audio. Use [`getAudioData()`](/docs/get-audio-data) to fetch it.
- `startTimeInSeconds`: `number` - trim the waveform to exclude all data before `startTimeInSeconds`.
- `durationInSeconds`: `number` - trim the waveform to exclude all data after `startTimeInSeconds + durationInSeconds`.
- `numberOfSamples`: `number` - how big you want the result array to be. The function will compress the waveform to fit in `numberOfSamples` data points.

## Return value

`Bar[]` - An array of objects with the following properties:

- `index`: `number` - the index of the datapoint, starting at 0. Useful for specifying as React `key` attribute without getting a warning.
- `amplitude`: `number` - a value describing the amplitude / volume / loudness of the audio.

## Example

```tsx twoslash
// @module: ESNext
// @target: ESNext
import { Audio } from "remotion";
// ---cut---
import { getAudioData, getWaveformPortion } from "@remotion/media-utils";
import music from "./music.mp3";

const audioData = await getAudioData(music); /* {
  channelWaveforms: [Float32Array(4410000), Float32Array(4410000)],
  sampleRate: 44100,
  durationInSeconds: 100.0000,
  numberOfChannels: 2,
  resultId: "0.432878981",
  isRemote: false
} */

const waveformPortion = await getWaveformPortion({
  audioData,
  // Will select time range of 20-40 seconds
  startTimeInSeconds: 20,
  durationInSeconds: 20,
  numberOfSamples: 10,
}); // [{index: 0, amplitude: 1.2203}, ... {index: 9, amplitude: 3.2211}]

console.log(waveformPortion.length); // 10
```

## Alternatives

The [`visualizeAudio()`](/docs/visualize-audio) function is more suitable for visualizing audio based on frequency properties of the audio (bass, mids, highs, etc).

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/media-utils/src/get-waveform-portion.ts)
- [Using audio](/docs/using-audio)
- [`<Audio/>`](/docs/audio)
