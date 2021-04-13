---
title: Using audio
id: using-audio
---

:::warning
This function is part of Remotion 2.0 which is not yet released. The information on this page might not yet accurately reflect the current state of Remotions API.
:::warning

You can import an audio file using an `import` statement:

```tsx
import audio from './audio.mp3'
```

You may add an [`<Audio/>`](/docs/audio) tag to your composition to add sound to it.

```tsx
import {Audio} from 'remotion';
import audio from './audio.mp3'

export const MyComposition: React.FC = () => {
  return (
    <div>
      <h1>Hello World!</h1>
      <Audio src={audio} />
    </div>
  )
}
```

The audio will play from the start, at full volume and as long as the duration of the composition or the duration of the audio is long, whatever is shorter.

## Cutting or trimming the audio

You can use the [`<Sequence />`](/docs/sequence) API to cut and trim audio.
As a convienience, the `<Audio />` tag supports the `startFrom` and `endAt` props.
