---
image: /generated/articles-docs-non-seekable-media.png
id: non-seekable-media
title: Non-seekable media
crumb: "Troubleshooting"
---

If you see the following error in the console:

```
The media [src] cannot be seeked.
This could be one of two reasons:
1) The media resource was replaced while the video is playing but it was not loaded yet.
2) The media does not support seeking.
Please see https://remotion.dev/docs/non-seekable-media for assistance.
```

## Meaning

This error could occur due to one of two reasons:

<Step>1</Step> A video or audio has entered the video while not being preloaded. <br/><br/>

Most commonly this happens when an audio has been replaced while the video is playing, for example due to user input changing. You can fix this by first [preloading the assets](/docs/player/preloading) before you mount them in an audio tag - for this the assets need to support CORS.

```tsx twoslash
const setAudioUrl = (url: string) => {};
// ---cut---

import { prefetch, staticFile } from "remotion";

const MyComp = () => {
  return (
    <select
      onChange={(e) => {
        prefetch(e.target.value)
          .waitUntilDone()
          .then(() => {
            setAudioUrl(e.target.value);
          });
      }}
    >
      <option value={staticFile("sample.mp3")}>Audio 0</option>
      <option value={staticFile("sample2.mp3")}>Audio 1</option>
      <option value={staticFile("sample3.mp3")}>Audio 2</option>
    </select>
  );
};
```

<Step>2</Step> A video or audio was provided that cannot be seeked to an arbitrary time.

The cause for this is that when requesting the media file, either:

- No `Content-Range` HTTP header has been sent by the server, making it impossible for the browser and therefore for Remotion to seek the media.
- No `Content-Length` HTTP header has been sent by the server, also preventing seeking.
- The file does not support [Faststart](https://www.videoconverterfactory.com/tips/mp4-fast-start.html)

You can verify that this is the problem by opening the video or audio in a new tab and observe that you cannot seek the media.

Consider one of these solutions:

- Serve the media from a webhost that supports the `Range` header and returns a `Content-Length` and `Content-Range` header.
- Download the media and import it locally using an `import` or `require()` statement.
- Use the [`<OffthreadVideo>`](/docs/offthreadvideo) component which will render the video fine. You may still see problems during playback in the Remotion Studio or the [`<Player>`](/docs/player).
