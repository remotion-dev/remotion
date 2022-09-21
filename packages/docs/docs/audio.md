---
title: <Audio>
id: audio
---

Using this component, you can add audio to your video. All audio formats which are supported by Chromium are supported by the component.

## API

### `src`

[Put an audio file into the `public/` folder](/docs/assets) and use [`staticFile()`](/docs/staticfile) to reference it.

```tsx twoslash
import { AbsoluteFill, Audio, staticFile } from "remotion";

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio.mp3")} />
    </AbsoluteFill>
  );
};
```

### `volume`

The component also accepts a `volume` props which allows you to control the volume of the audio in it's entirety or frame by frame. Read the page on [using audio](/docs/using-audio) to learn more.

```tsx twoslash
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Audio volume={0.5} src={staticFile("background.mp3")} />
      <Audio
        volume={(f) =>
          interpolate(f, [0, 30], [0, 1], { extrapolateLeft: "clamp" })
        }
        src={staticFile("voice.mp3")}
      />
    </AbsoluteFill>
  );
};
```

### `startFrom` / `endAt`

`<Audio>` has two more helper props you can use:

- `startFrom` will remove a portion of the audio at the beginning
- `endAt` will remove a portion of the audio at the end

In the following example, we assume that the [`fps`](/docs/composition#fps) of the composition is `30`.

By passing `startFrom={60}`, the playback starts immediately, but with the first 2 seconds of the audio trimmed away.  
By passing `endAt={120}`, any audio after the 4 second mark in the file will be trimmed away.

The audio will play the range from `00:02:00` to `00:04:00`, meaning the audio will play for 2 seconds.

```tsx twoslash
import { Audio, staticFile } from "remotion";

export const MyVideo = () => {
  return (
    <div>
      <div>Hello World!</div>
      <Audio src={staticFile("audio.mp3")} startFrom={60} endAt={120} />
    </div>
  );
};
```

### `playbackRate`

_Available from v2.2_

You can use the `playbackRate` prop to control the speed of the audio. `1` is the default and means regular speed, `0.5` slows down the audio so it's twice as long and `2` speeds up the audio so it's twice as fast.

While Remotion doesn't limit the range of possible playback speeds, in development mode the [`HTMLMediaElement.playbackRate`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate) API is used which throws errors on extreme values. At the time of writing, Google Chrome throws an exception if the playback rate is below `0.0625` or above `16`.

### `muted`

_Available from v2.0_

The `muted` prop will be respected. It will lead to no audio being played while still keeping the audio tag mounted. It's value may change over time, for example to only mute a certain section of the audio

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/audio/Audio.tsx)
- [Using audio](/docs/using-audio)
- [Audio visualization](/docs/audio-visualization)
- [`<Video />`](/docs/video)
