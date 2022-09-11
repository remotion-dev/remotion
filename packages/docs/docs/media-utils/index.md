---
title: "@remotion/media-utils"
---

A package providing utility functions for getting information about video and audio, and for visualizing audio.

Except for [`useAudioData()`](/docs/use-audio-data), all functions can also be used outside of Remotion.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'pnpm', value: 'pnpm', },
{ label: 'yarn', value: 'yarn', },
]
}>
<TabItem value="npm">

```bash
npm i @remotion/media-utils
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i @remotion/media-utils
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add @remotion/media-utils
```

  </TabItem>
</Tabs>

## Functions

- [`audioBufferToDataUrl()`](/docs/audio-buffer-to-data-url)
- [`getAudioData()`](/docs/get-audio-data)
- [`getAudioDurationInSeconds()`](/docs/get-audio-duration-in-seconds)
- [`getVideoMetadata()`](/docs/get-video-metadata)
- [`getWaveformPortion()`](/docs/get-waveform-portion)
- [`useAudioData()`](/docs/use-audio-data)
- [`visualizeAudio()`](/docs/visualize-audio)

## License

MIT
