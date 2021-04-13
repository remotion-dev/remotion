---
title: <Audio /> (experimental)
sidebar_label: <Audio /> 🚧
id: audio
---

:::warning
This component is a work in progress. The final output **does not** yet have audio even with this component. At the moment, you need to add audio manually after the render, but you may find the component useful to listen to your intended audio track while editing your video
:::

Using this component, you can add audio to your video. All audio formats which are supported by Chromium are supported by the component. There is currently no option to trim audio or control it's volume. **Audio currently only plays in the preview.**

## API / Example

Use an import or require to load an audio file and pass it to the `src` props of the `<Audio />` component.

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

- [`<Video />`](/docs/video)
