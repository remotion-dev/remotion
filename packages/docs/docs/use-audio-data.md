---
image: /generated/articles-docs-use-audio-data.png
title: useAudioData()
id: use-audio-data
crumb: "@remotion/media-utils"
---

_Part of the `@remotion/media-utils` package of helper functions._

This convenience function wraps the [`getAudioData()`](/docs/get-audio-data) function into a hook and does 3 things:

- Keeps the audio data in a state
- Wraps the function in a [`delayRender()` / `continueRender()`](/docs/data-fetching) pattern.
- Handles the case where the component gets unmounted while the fetching is in progress and a React error is thrown.

Using this function, you can elegantly render a component based on audio properties, for example together with the [`visualizeAudio()`](/docs/visualize-audio) function.

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

`AudioData | null` - An object containing audio data (see documentation of [`getAudioData()`](/docs/get-audio-data)) or `null` if the data has not been loaded.

## Example

```tsx twoslash
import { Audio } from "remotion";
// ---cut---
import { useAudioData } from "@remotion/media-utils";
import music from "./music.mp3";

export const MyComponent: React.FC = () => {
  const audioData = useAudioData(music);

  if (!audioData) {
    return null;
  }

  return <div>This file has a {audioData.sampleRate} sampleRate.</div>;
};
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/media-utils/src/use-audio-data.ts)
- [`getAudioData()`](/docs/get-audio-data)
- [`visualizeAudio()`](/docs/visualize-audio)
- [Audio visualization](/docs/audio-visualization)
