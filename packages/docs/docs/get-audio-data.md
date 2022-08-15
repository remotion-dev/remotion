---
title: getAudioData()
id: get-audio-data
---

_Part of the `@remotion/media-utils` package of helper functions._

Takes an audio `src`, loads it and returns data and metadata for the specified source.

:::info
Remote audio files need to support [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

<details>
<summary>More info</summary>
<ul>
<li>
Remotion's origin is usually <code>http://localhost:3000</code>, but it may be different if rendering on Lambda or the port is busy.
</li>
<li>
You can use <a href="/docs/get-audio-duration-in-seconds"><code>getAudioDurationInSeconds()</code></a> without the audio needing CORS.
</li>
<li>
You can <a href="/docs/chromium-flags#--disable-web-security">disable CORS</a> during renders.
</li>
</ul>
</details>
:::

## Arguments

### `src`

A string pointing to an audio asset.

## Return value

`Promise<AudioData>` - object with information about the audio data:

- `channelWaveforms`: `Float32Array[]` an array with waveform information for each channel.
- `sampleRate`: `number` How many samples per second each waveform contains.
- `durationInSeconds`: `number` The duration of the audio in seconds.
- `numberOfChannels`: `number` The number of channels contained in the audio file. This corresponds to the length of the `channelWaveforms` array.
- `resultId`: `string` Unique identifier of this audio data fetching call. Other functions can cache expensive operations if they get called with the same resultId multiple times.
- `isRemote`: `boolean` Whether the audio was imported locally or from a different origin.

## Example

```ts twoslash
// @module: ESNext
// @target: ESNext
import { Audio, staticFile } from "remotion";
// ---cut---
import { getAudioData } from "@remotion/media-utils";
import music from "./music.mp3";

await getAudioData(music); /* {
  channelWaveforms: [Float32Array(4410000), Float32Array(4410000)],
  sampleRate: 44100,
  durationInSeconds: 100.0000,
  numberOfChannels: 2,
  resultId: "0.432878981",
  isRemote: false
} */
await getAudioData("https://example.com/remote-audio.aac"); /* {
  channelWaveforms: [Float32Array(4800000)],
  sampleRate: 48000,
  durationInSeconds: 100.0000,
  numberOfChannels: 1,
  resultId: "0.432324444",
  isRemote: true
} */
await getAudioData(staticFile("my-file.wav")); /* {
  channelWaveforms: [Float32Array(4800000)],
  sampleRate: 48000,
  durationInSeconds: 100.0000,
  numberOfChannels: 1,
  resultId: "0.6891332223",
  isRemote: false
} */
```

## Caching behavior

This function is memoizing the results it returns.
If you pass in the same argument to `src` multiple times, it will return a cached version from the second time on, regardless of if the file has changed. To clear the cache, you have to reload the page.

## Alternatives

If you need only the duration, prefer [`getAudioDurationInSeconds()`](/docs/get-audio-duration-in-seconds) which is faster because it doesn't need to read waveform data.

Use the [`useAudioData()`](/docs/use-audio-data) helper hook to not have to do state management yourself and to wrap the call in [`delayRender()`](/docs/delay-render).

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/media-utils/src/get-audio-data.ts)
- [Using audio](/docs/using-audio)
- [Audio visualization](/docs/audio-visualization)
- [`<Audio/>`](/docs/audio)
- [`visualizeAudio()`](/docs/visualize-audio)
- [`useAudioData()`](/docs/use-audio-data)
