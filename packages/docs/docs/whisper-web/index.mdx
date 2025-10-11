---
image: /generated/articles-docs-whisper-web-index.png
title: '@remotion/whisper-web'
crumb: 'Transcribe audio in browser'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::warning
**Unstable API**: This package is experimental for the moment. As we test it, we might make a few changes to the API and switch to a WebGPU-based backend in the future.
:::

Similar to [@remotion/install-whisper-cpp](/docs/install-whisper-cpp) but for the browser. Allows you to transcribe audio locally in the browser, with the help of WASM.

import {TableOfContents} from './whisper-web';

## Installation

<Installation pkg="@remotion/whisper-web" />

## Required configuration

`@remotion/whisper-web` uses a WebAssembly (WASM) backend that requires `SharedArrayBuffer` support. To enable this functionality, you need to configure cross-origin isolation headers in your application. This is a [security requirement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements) for using `SharedArrayBuffer` in modern browsers.

See: [Important Considerations](/docs/whisper-web/can-use-whisper-web#important-considerations)

### Vite

To use `@remotion/whisper-web` with Vite, you need to make two important changes:

1. Exclude the package from Vite's dependency optimization to prevent [known issues](https://github.com/vitejs/vite/issues/11672#issuecomment-1397855641)
2. Configure the required security headers for `SharedArrayBuffer` support

```tsx title="vite.config.ts"
import {defineConfig} from 'vite';

export default defineConfig({
  optimizeDeps: {
    // turn off dependency optimization: https://github.com/vitejs/vite/issues/11672#issuecomment-1397855641
    exclude: ['@remotion/whisper-web'],
  },
  // required by SharedArrayBuffer
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  // ...
});
```

## Example usage

```tsx twoslash title="Transcribing with @remotion/whisper-web"
import {transcribe, canUseWhisperWeb, resampleTo16Khz, downloadWhisperModel} from '@remotion/whisper-web';

const file = new File([], 'audio.wav');
const modelToUse = 'tiny.en';

const {supported, detailedReason} = await canUseWhisperWeb(modelToUse);
if (!supported) {
  throw new Error(`Whisper Web is not supported in this environment: ${detailedReason}`);
}

console.log('Downloading model...');
await downloadWhisperModel({
  model: modelToUse,
  onProgress: ({progress}) => console.log(`Downloading model (${Math.round(progress * 100)}%)...`),
});

console.log('Resampling audio...');
const channelWaveform = await resampleTo16Khz({
  file,
  onProgress: (p) => console.log(`Resampling audio (${Math.round(p * 100)}%)...`),
});

console.log('Transcribing...');
const {transcription} = await transcribe({
  channelWaveform,
  model: modelToUse,
  onProgress: (p) => console.log(`Transcribing (${Math.round(p * 100)}%)...`),
});

console.log(transcription.map((t) => t.text).join(' '));
```

## Functions

<TableOfContents />

## License

MIT
