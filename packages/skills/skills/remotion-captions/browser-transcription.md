---
name: browser-transcription
description: In-browser audio transcription using @remotion/whisper-webgpu (no server, no API key)
metadata:
  tags: captions, transcribe, whisper, webgpu, browser, speech-to-text
---

# Transcribing audio in the browser (WebGPU, no server)

Use `@remotion/whisper-webgpu` instead of [transcribe-captions.md](transcribe-captions.md)'s `@remotion/install-whisper-cpp` when transcription needs to happen client-side — a `<Player>`-embedded app, a browser-only tool, or anywhere a Node.js script isn't available or an API key shouldn't be required. It runs a timestamped Whisper model locally over WebGPU via Transformers.js; no audio ever leaves the browser.

## Prerequisites

```bash
npx remotion add @remotion/whisper-webgpu @huggingface/transformers
```

Available from Remotion `4.0.518`. Requires WebGPU and a secure context (HTTPS or `localhost`). Check support first:

```tsx
import { canUseWhisperWebGpu } from "@remotion/whisper-webgpu";

const result = await canUseWhisperWebGpu();
if (!result.supported) {
  // result.reason is one of: window-undefined, webgpu-unavailable, webgpu-requires-secure-context
  throw new Error(result.detailedReason);
}
```

## Transcribing

```tsx
import {
  resampleTo16Khz,
  transcribe,
  toCaptions,
} from "@remotion/whisper-webgpu";

const file = new File([], "audio.wav"); // a Blob/File from an <input type="file"> or fetch()

// transcribe() needs a mono 16kHz Float32Array.
const channelWaveform = await resampleTo16Khz({
  file,
  onProgress: (progress) => console.log("decoding", progress),
});

const transcription = await transcribe({
  channelWaveform,
  model: "small.en", // "small" or "small.en" recommended; use an -.en model to skip language detection
  // language: "english", // required for multilingual (non-".en") models
});

// Converts straight to Remotion's Caption[] format.
const { captions } = toCaptions({ whisperWebGpuOutput: transcription });
```

`toCaptions()`'s `confidence` is always `null` — Transformers.js doesn't expose calibrated word confidence for this pipeline.

Write the resulting `captions` to a JSON file in `public/` (or hold them in state for immediate display) exactly as with any other `Caption[]` source — see [display-captions.md](display-captions.md).

## Model download

The model is downloaded from `remotion.media` on first use and cached by the browser. Call `loadWhisperModel({model, onProgress})` ahead of time to show download progress, and `isWhisperModelCached({model})` to check the cache without downloading. `disposeWhisperModel()` frees the in-memory model; `removeWhisperModel()` also clears the persistent cache. Call `clearStaleModels()` on page load to drop model files a previous package version downloaded that the current version no longer uses.

## When to use which transcription method

- **No green screen, need to cut out a moving subject** → this is a different capability, see [video-matting.md](../remotion-markup/video-matting.md).
- **A Node.js render/build step, no browser needed** → [transcribe-captions.md](transcribe-captions.md) (`@remotion/install-whisper-cpp`), fully offline once the model is downloaded once.
- **Must run client-side, or want to avoid a server round-trip / API key** → this file (`@remotion/whisper-webgpu`), needs WebGPU.
- **Already have a transcript from OpenAI's hosted Whisper API** → `openAiWhisperApiToCaptions()` from `@remotion/openai-whisper` converts it to `Caption[]`; that package doesn't call the API for you.
