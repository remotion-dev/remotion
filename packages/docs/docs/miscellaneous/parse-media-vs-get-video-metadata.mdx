---
image: /generated/articles-docs-miscellaneous-parse-media-vs-get-video-metadata.png
title: parseMedia() vs. getVideoMetadata()
crumb: 'FAQ'
sidebar_label: parseMedia() vs. getVideoMetadata()
---

There are multiple ways to retrieve information about a media such as:

- Duration
- Width and height
- Codec, container, framerate

## Recommendation: `parseMedia()`

[`parseMedia()`](/docs/media-parser/parse-media) is a library developed by Remotion that parses video files using JavaScript.

### Advantages

✅ It supports more containers than [`getVideoMetadata()`](/docs/get-video-metadata): `.mp4`, `.mov`, `.webm`, `.mkv`, `.avi`, `.m3u8`, `.ts`, `.mp3`, `.wav`, `.aac`, `.m4a` and `.flac`
✅ It supports getting get dimensions of videos shot on iPhones, a common pitfall when using [`getVideoMetadata()`](/docs/get-video-metadata) on Linux  
✅ It also works on the server in Node.js and Bun.  
✅ It only fetches the information you request, needing to read less bytes to get the information you need.

### Disadvantages

❌ When using in the browser: Assets need to come from the same origin or be CORS-enabled.

## `getVideoMetadata()` from `@remotion/media-utils`

[`getVideoMetadata()`](/docs/get-video-metadata) will mount a `<video>` tag in the browser and returns the metadata after it is available.

### Advantages

✅ In the browser, it does not require the assets to be CORS-enabled or be on the same origin.

### Disadvantages

❌ It only works in the browser.  
❌ It does not support some codecs, such as the ones used by iPhone videos.

## `getVideoMetadata()` from `@remotion/renderer`

[`getVideoMetadata()`](/docs/renderer/get-video-metadata) will read metadata using FFmpeg through a Rust interface.

### Advantages

✅ The widest format compatibility.

### Disadvantages

❌ It only works in Node.js and Bun, so you cannot use it in [`calculateMetadata()`](/docs/calculate-metadata).  
❌ It invokes a Rust binary, so bundling it is not straightforward.

## See also

- [`parseMedia()`](/docs/media-parser/parse-media)
- [`@remotion/media-utils`: `getVideoMetadata()`](/docs/get-video-metadata)
- [`@remotion/renderer`: `getVideoMetadata()`](/docs/renderer/get-video-metadata)
