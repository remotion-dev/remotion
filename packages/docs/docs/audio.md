---
title: <Audio>
id: audio
---

Using this component, you can add audio to your video. All audio formats which are supported by Chromium are supported by the component.

## API / Example

Use an import or require to load an audio file and pass it to the `src` props of the `<Audio />` component.

The component also accepts a `volume` props which allows you to control the volume of the audio in it's entirety or frame by frame. Read the page on [using audio](/docs/using-audio) to learn more.

`<Audio>` has two more helper props: `startFrom` and `endAt` for defining the start frame and end frame. Both are optional and do not get forwarded to the native `<audio>` element but tell Remotion which portion of the audio should be included.

```tsx twoslash
import { Audio } from "remotion";
import audio from "./audio.mp3";

export const MyVideo = () => {
  return (
    <div>
      <div>Hello World!</div>
      <Audio
        src={audio}
        startFrom={59} // if composition is 30fps, then it will start at 2s
        endAt={120} // if composition is 30fps, then it will end at 4s
      />
    </div>
  );
};
```

## Controlling volume

You can use the `volume` prop to control the loudness of the audio. See [Controlling audio](/docs/using-audio#controlling-volume) for more information.

## Controlling playback speed

_Available from v2.2_

You can use the `playbackRate` prop to control the speed of the audio. `1` is the default and means regular speed, `0.5` slows down the audio so it's twice as long and `2` speeds up the audio so it's twice as fast.

While Remotion doesn't limit the range of possible playback speeds, in development mode the [`HTMLMediaElement.playbackRate`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate) API is used which throws errors on extreme values. At the time of writing, Google Chrome throws an exception if the playback rate is below `0.0625` or above `16`.

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/audio/Audio.tsx)
- [Using audio](/docs/using-audio)
- [Audio visualization](/docs/audio-visualization)
- [`<Video />`](/docs/video)
