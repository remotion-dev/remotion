---
title: <Audio />
id: audio
---

Using this component, you can add audio to your video. All audio formats which are supported by Chromium are supported by the component.

:::info
Version 1.x doesn't render audio to an output. Make sure to upgrade to [Remotion 2.0](/docs/2-0-migration) to render audio.
:::

## API / Example

Use an import or require to load an audio file and pass it to the `src` props of the `<Audio />` component.

The component also accepts a `volume` props which allows you to control the volume of the audio in it's entirety or frame by frame. Read the page on [using audio](/docs/using-audio) to learn more.

`<Audio>` has two more helper props: `startFrom` and `endAt` for defining the start frame and end frame. Both are optional and do not get forwarded to the native `<audio>` element but tell Remotion which portion of the audio should be included.

```tsx
import {Audio} from 'remotion';
import audio from './audio.mp3'

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
  )
}
```

## See also

- [Using audio](/docs/audio)
- [Audio visualization](/docs/audio-visualization)
- [`<Video />`](/docs/video)
