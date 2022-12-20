---
image: /generated/articles-docs-non-seekable-media.png
id: non-seekable-media
title: Non-seekable media
crumb: "Troubleshooting"
---

If you see the following error in the console:

```
The media [URL] does not seem to support seeking.
Remotion cannot properly handle it.
Please see https://remotion.dev/docs/non-seekable-media for assistance.
```

## Meaning

It means you have provided a video or audio that cannot be seeked to an arbitrary time.  
The cause for this is that when requesting the media file, either:

- No `Content-Range` HTTP header has been sent by the server, making it impossible for the browser and therefore for Remotion to seek the media.
- No `Content-Length` HTTP header has been sent by the server, also preventing seeking.
- The file does not support [Faststart](https://www.videoconverterfactory.com/tips/mp4-fast-start.html)

## Reproduction

You can verify that this is the problem by opening the video or audio in a new tab and observe that you cannot seek the media.

## Solutions

Choose one of those solutions:

- Serve the media from a webhost that supports the `Range` header and returns a `Content-Length` and `Content-Range` header.
- Download the media and import it locally using an `import` or `require()` statement.
- Use the [`<OffthreadVideo>`](/docs/offthreadvideo) component which will render the video fine. You may still see problems during playback in the preview or the [`<Player>`](/docs/player)
