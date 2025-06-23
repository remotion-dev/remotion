---
image: /generated/articles-docs-whisper-web-transcribe.png
title: transcribe()
crumb: '@remotion/whisper-web'
---

# transcribe()

:::warning
**Unstable API**: This package is experimental for the moment. As we test it, we might make a few changes to the API and switch to a WebGPU-based backend in the future.
:::

Transcribes pre-processed audio data (a `Float32Array` waveform) using WebAssembly-compiled Whisper.cpp, returning the transcription.

To transcribe an audio file, you first need to download a model using [`downloadWhisperModel()`](/docs/whisper-web/download-whisper-model) and turn the file into a 16kHz `Float32Array` using [`resampleTo16Khz()`](/docs/whisper-web/resample-to-16khz).

## Requirements

This package requires a page that is [cross-origin isolated](/docs/miscellaneous/cross-origin-isolation).

## Example

```tsx twoslash title="app.ts"
import {resampleTo16Khz} from '@remotion/whisper-web';
const file = new File([], 'audio.wav');

const channelWaveform = await resampleTo16Khz({
  file,
  onProgress: (p) => console.log(`Resampling audio (${Math.round(p * 100)}%)...`),
});

// ---cut---
import {transcribe} from '@remotion/whisper-web';

const {transcription} = await transcribe({
  channelWaveform,
  model: 'tiny.en',
  onProgress: (p) => console.log(`Transcribing (${Math.round(p * 100)}%)...`),
});

console.log(transcription.map((t) => t.text).join(' '));
```

## Arguments

### `channelWaveform`

A `Float32Array` representing the mono audio waveform data, resampled to 16kHz. This is typically obtained by calling [`resampleTo16Khz()`](/docs/whisper-web/resample-to-16khz) with an audio `File` or `Blob`.

### `model`

The Whisper model to use for transcription (e.g., `'tiny.en'`, `'base'`, `'small'`). This determines the size, speed, and accuracy of the model. Ensure the model has been downloaded using [`downloadWhisperModel()`](/docs/whisper-web/download-whisper-model) before calling `transcribe`.

Possible values: `tiny`, `tiny.en`, `base`, `base.en`, `small`, `small.en`.

For a list of available model names, refer to the `WhisperModel` type exported by the package or the models supported by `downloadWhisperModel()`.

### `language?`

default: `'auto'`

Optional. The language of the audio in ISO 639-1 format (e.g., `'en'`, `'es'`, `'de'`). Set to `'auto'` for automatic language detection by Whisper.

Possible values: `Afrikaans`, `Albanian`, `Amharic`, `Arabic`, `Armenian`, `Assamese`, `Azerbaijani`, `Bashkir`, `Basque`, `Belarusian`, `Bengali`, `Bosnian`, `Breton`, `Bulgarian`, `Burmese`, `Castilian`, `Catalan`, `Chinese`, `Croatian`, `Czech`, `Danish`, `Dutch`, `English`, `Estonian`, `Faroese`, `Finnish`, `Flemish`, `French`, `Galician`, `Georgian`, `German`, `Greek`, `Gujarati`, `Haitian`, `Haitian Creole`, `Hausa`, `Hawaiian`, `Hebrew`, `Hindi`, `Hungarian`, `Icelandic`, `Indonesian`, `Italian`, `Japanese`, `Javanese`, `Kannada`, `Kazakh`, `Khmer`, `Korean`, `Lao`, `Latin`, `Latvian`, `Letzeburgesch`, `Lingala`, `Lithuanian`, `Luxembourgish`, `Macedonian`, `Malagasy`, `Malay`, `Malayalam`, `Maltese`, `Maori`, `Marathi`, `Moldavian`, `Moldovan`, `Mongolian`, `Myanmar`, `Nepali`, `Norwegian`, `Nynorsk`, `Occitan`, `Panjabi`, `Pashto`, `Persian`, `Polish`, `Portuguese`, `Punjabi`, `Pushto`, `Romanian`, `Russian`, `Sanskrit`, `Serbian`, `Shona`, `Sindhi`, `Sinhala`, `Sinhalese`, `Slovak`, `Slovenian`, `Somali`, `Spanish`, `Sundanese`, `Swahili`, `Swedish`, `Tagalog`, `Tajik`, `Tamil`, `Tatar`, `Telugu`, `Thai`, `Tibetan`, `Turkish`, `Turkmen`, `Ukrainian`, `Urdu`, `Uzbek`, `Valencian`, `Vietnamese`, `Welsh`, `Yiddish`, `Yoruba`, `Zulu`.
Or their corresponding ISO 639-1 codes:
`af`, `am`, `ar`, `as`, `az`, `ba`, `be`, `bg`, `bn`, `bo`, `br`, `bs`, `ca`, `cs`, `cy`, `da`, `de`, `el`, `en`, `es`, `et`, `eu`, `fa`, `fi`, `fo`, `fr`, `gl`, `gu`, `ha`, `haw`, `he`, `hi`, `hr`, `ht`, `hu`, `hy`, `id`, `is`, `it`, `ja`, `jw`, `ka`, `kk`, `km`, `kn`, `ko`, `la`, `lb`, `ln`, `lo`, `lt`, `lv`, `mg`, `mi`, `mk`, `ml`, `mn`, `mr`, `ms`, `mt`, `my`, `ne`, `nl`, `nn`, `no`, `oc`, `pa`, `pl`, `ps`, `pt`, `ro`, `ru`, `sa`, `sd`, `si`, `sk`, `sl`, `sn`, `so`, `sq`, `sr`, `su`, `sv`, `sw`, `ta`, `te`, `tg`, `th`, `tk`, `tl`, `tr`, `tt`, `uk`, `ur`, `uz`, `vi`, `yi`, `yo`, `zh`, or `'auto'`.

For a list of supported language codes, refer to the official Whisper documentation or the `WhisperLanguage` type exported by the package.

### `onProgress?`

Optional. Act upon transcription progress. The `progress` value is a number between 0 and 1.

```tsx twoslash
// @noErrors
// ---cut---
const onProgress = (progress: number) => {
  console.log(`Transcription progress: ${Math.round(progress * 100)}%`);
};
```

### `onTranscriptionChunk?`

Callback function that receives an array of `TranscriptionItemWithTimestamp` objects as transcription segments are processed. This is useful for displaying live transcription updates.

### `threads?`

The number of threads to use for transcription. Defaults to `4`. Using more threads can speed up transcription but increases CPU usage. The maximum allowed is 16; requests for more will be rejected.

### `logLevel?`

Default: `info`

**Type:** `'trace' | 'verbose' | 'info' | 'warn' | 'error'`

Determines how much info is being logged to the console.

## Concurrency

**Important Note:** The `transcribe()` function cannot be called multiple times concurrently. If you attempt to start a new transcription while one is already in progress, the new call will be rejected with an error. Ensure that a transcription process is complete or has been robustly handled before starting a new one.

## See also

- [Source code for `transcribe()`](https://github.com/remotion-dev/remotion/blob/main/packages/whisper-web/src/transcribe.ts)
- [`resampleTo16Khz()`](/docs/whisper-web/resample-to-16khz)
- [`downloadWhisperModel()`](/docs/whisper-web/download-whisper-model)
- [`@remotion/whisper-web`](/docs/whisper-web)
