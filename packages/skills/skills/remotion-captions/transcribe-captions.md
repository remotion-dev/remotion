# Transcribing audio

The CLI and API workflows below use [`@remotion/whisper-webgpu`](https://www.remotion.dev/docs/whisper-webgpu.md) and require a compatible GPU. Node.js transcription through ONNX Runtime is unavailable on Linux arm64. See the [transcription options](https://www.remotion.dev/docs/captions/transcribing.md) for other setups.

Transcribe each original source video or audio file individually, including portions currently trimmed out of the edit. Keep each transcript separate and its timestamps relative to the beginning of the source file.

## Installing dependencies

Check the project's package manager and workspace before installing. If `node_modules` is a symlink, follow the install workflow that manages the link. Preserve the dependency layout and let the package manager update its lockfile.

Use [`remotion add`](https://www.remotion.dev/docs/cli/add.md) to select the version that matches the installed Remotion packages. The examples use `npx remotion` for npm. Use `bunx remotion` for Bun, `yarn remotion` for Yarn, or `pnpm exec remotion` for pnpm.

## Transcribing local files with the CLI

From Remotion 4.0.546, use [`remotion whisper transcribe`](https://www.remotion.dev/docs/cli/whisper/transcribe.md) to generate a `Caption[]` JSON file. Add the required packages if they are missing:

```bash
npx remotion add @remotion/whisper-webgpu @huggingface/transformers
```

```bash
npx remotion whisper transcribe public/video123.mp4 --no-overwrite
```

This downloads the model if needed and writes `public/video123-captions.json`. Use `--language` with the spoken language for non-English media.

## Transcribing in a Node.js script

Use a script for programmatic transcription or for local files on Remotion 4.0.530 through 4.0.545. Add the script's dependencies if they are missing:

```bash
npx remotion add @remotion/whisper-webgpu @huggingface/transformers mediabunny @mediabunny/server
```

Decode the audio to a 16 kHz mono waveform, then download the model and call [`transcribe()`](https://www.remotion.dev/docs/whisper-webgpu/transcribe.md).

```ts
import { registerMediabunnyServer } from "@mediabunny/server";
import {
  WHISPER_WEBGPU_SAMPLE_RATE,
  canUseWhisperWebGpu,
  downloadWhisperModel,
  loadWhisperModel,
  toCaptions,
  transcribe,
} from "@remotion/whisper-webgpu";
import {
  ALL_FORMATS,
  Conversion,
  FilePathSource,
  Input,
  NullTarget,
  Output,
  WavOutputFormat,
} from "mediabunny";
import { writeFile } from "node:fs/promises";

registerMediabunnyServer();

const support = await canUseWhisperWebGpu();
if (!support.supported) {
  throw new Error(support.detailedReason);
}

type WaveformChunk = {
  startFrame: number;
  waveform: Float32Array;
};
const chunks: WaveformChunk[] = [];

using input = new Input({
  formats: ALL_FORMATS,
  source: new FilePathSource("public/video123.mp4"),
});
const audioTrack = await input.getPrimaryAudioTrack();
if (audioTrack === null) {
  throw new Error("The media does not contain an audio track.");
}

const conversion = await Conversion.init({
  input,
  output: new Output({
    format: new WavOutputFormat(),
    target: new NullTarget(),
  }),
  video: { discard: true },
  audio: (track) => {
    if (track.id !== audioTrack.id) {
      return { discard: true };
    }

    return {
      codec: "pcm-f32",
      forceTranscode: true,
      numberOfChannels: 1,
      sampleFormat: "f32",
      sampleRate: WHISPER_WEBGPU_SAMPLE_RATE,
      process: (sample) => {
        const waveform = new Float32Array(
          sample.allocationSize({ format: "f32", planeIndex: 0 }) /
            Float32Array.BYTES_PER_ELEMENT,
        );
        sample.copyTo(waveform, { format: "f32", planeIndex: 0 });
        chunks.push({
          startFrame: Math.round(sample.timestamp * WHISPER_WEBGPU_SAMPLE_RATE),
          waveform,
        });
        return sample;
      },
    };
  },
});

if (!conversion.isValid) {
  throw new Error("The audio track cannot be decoded.");
}

await conversion.execute();

const waveformLength = chunks.reduce(
  (max, chunk) => Math.max(max, chunk.startFrame + chunk.waveform.length),
  0,
);
const channelWaveform = new Float32Array(waveformLength);
for (const chunk of chunks) {
  const destinationStart = Math.max(0, chunk.startFrame);
  const sourceStart = Math.max(0, -chunk.startFrame);
  const availableLength = Math.min(
    chunk.waveform.length - sourceStart,
    channelWaveform.length - destinationStart,
  );

  if (availableLength > 0) {
    channelWaveform.set(
      chunk.waveform.subarray(sourceStart, sourceStart + availableLength),
      destinationStart,
    );
  }
}

const model = "small.en";
await downloadWhisperModel({ model });
await using modelHandle = await loadWhisperModel({ model });
const transcription = await transcribe({ channelWaveform, model });
const { captions } = toCaptions({ whisperWebGpuOutput: transcription });

// Write it to a file so the captions can be inlined into the Remotion code
await writeFile("captions123.json", JSON.stringify(captions, null, 2));
```

## Choosing a model

`small.en` is the recommended default for English.  
For other languages, use a multilingual model such as `small` and pass the `language` option to `transcribe()` - automatic language detection is not supported.  
See [`getAvailableModels()`](https://www.remotion.dev/docs/whisper-webgpu/get-available-models.md) for all models.

## Transcribing in the browser

For a browser integration, install `@remotion/whisper-webgpu` and `@huggingface/transformers` as shown in the CLI section. Use [`resampleTo16Khz()`](https://www.remotion.dev/docs/whisper-webgpu/resample-to-16khz.md) to get the waveform from a `File`:

```ts
import {
  downloadWhisperModel,
  resampleTo16Khz,
  toCaptions,
  transcribe,
} from "@remotion/whisper-webgpu";

export const transcribeFile = async (file: File) => {
  await downloadWhisperModel({ model: "small.en" });
  const channelWaveform = await resampleTo16Khz({ file });
  const transcription = await transcribe({
    channelWaveform,
    model: "small.en",
  });

  const { captions } = toCaptions({ whisperWebGpuOutput: transcription });
  return captions;
};
```

See [Displaying captions](display-captions.md) for how to display the captions in Remotion.
