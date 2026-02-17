---
image: /generated/articles-docs-editor-starter-captioning.png
title: Captioning in the Editor Starter
sidebar_label: Captioning
crumb: Editor Starter
---

The Editor Starter comes with a method to generate captions for videos and audio assets.  
It uses the OpenAI Whisper API by default.

For implementation details, refer to the source code in [`src/editor/captioning`](https://github.com/remotion-dev/editor-starter/tree/main/src/editor/captioning).

In the Editor Starter, captions are treated as a first-class [item type](/docs/editor-starter/tracks-items-assets#items), similar to videos, images, or audio. This allows them to be manipulated like any other layer in the timeline and canvas.

## Setup with OpenAI Whisper (recommended)

To generate captions using OpenAI's Whisper model, add your OpenAI key to the `.env` file:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

This enables server-side transcription if the [`/api/captions`](/docs/editor-starter/backend-routes#post-apicaptions) backend route is present.

Click "Generate Captions" on a video or audio layer:

1. The audio is extracted client-side.
2. It uploads it to [`/api/captions`](/docs/editor-starter/backend-routes#post-apicaptions) and transcribes it via OpenAI (note: [A limit of 25MB applies](/docs/editor-starter/features-not-included#captioning-long-audio-files))
3. It converts OpenAI's response into Remotion's [`Caption`](/docs/captions/caption) type and adds it to the timeline as a [`CaptionsItem`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+captionsitem&type=code).

## Editing

The [inspector](/docs/editor-starter/tracks-items-assets#inspectors) allows users to edit the following properties of captions by default:

- Individual tokens
- Typography: Font, text color, highlighted word color, text opacity, text stroke width & color
- Page duration
- Adjust timings of individual words

## Automated creation of pages

Captions are automatically split into "pages" for easier management. Pages are timed groups of words or sentences that fit nicely on screen. This is achieved by using [`createTikTokStyleCaptions`](/docs/captions/create-tiktok-style-captions) from [`@remotion/captions`](/docs/captions/api) package.

## Limits

The default way of captioning is to use the OpenAI Whisper API, which has a limit of 25MB per request.

At a 16Khz sample rate, this is about 13.4 minutes of mono audio.  
By default, the Editor Starter disables the captioning feature if the audio is longer than that.

Review the [logic of `MAX_DURATION_ALLOWING_CAPTIONING_IN_SEC`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20MAX_DURATION_ALLOWING_CAPTIONING_IN_SEC&type=code) to tweak it.

## Alternatives

### `@remotion/whisper-web`

You can replace the OpenAI Whisper API with [`@remotion/whisper-web`](/docs/whisper-web) for local, in-browser transcription.  
This eliminates the need for an OpenAI key and S3 fetches for transcription, but you'll still need to handle audio loading locally.

Caveats:

- Performance: Transcription runs on the CPU in the browser, which can be significantly slower than GPU-accelerated options like OpenAI's cloud service.
- Model size: Smaller models (e.g., 'tiny') are faster but less accurate; larger ones require more memory and space.
- You need to [enable cross-origin isolation](/docs/whisper-web/can-use-whisper-web#important-considerations) for your app.

### `@remotion/install-whisper-cpp`

You can use [`@remotion/install-whisper-cpp`](/docs/install-whisper-cpp) to transcribe audio on a Node.js server.

Caveats:

- You are responsible for hosting and scaling the server, which can be costly and complex.

### More alternatives

Any way of transcription can be used.  
We recommend that you convert the captions to the [`Caption`](/docs/captions/caption) shape so that rendering and editing the captions does not need to be refactored.

## See also

- [`@remotion/captions`](/docs/captions/api)
- [`@remotion/whisper-web`](/docs/whisper-web)
- [`@remotion/install-whisper-cpp`](/docs/install-whisper-cpp)
