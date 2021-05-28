---
id: non-seekable-media
title: Non-seekable media
---

If you see the following error in the console:

```
The media [audio source] does not seem to support seeking. Remotion cannot properly handle it. Please see https://remotion.dev/docs/non-seekable-media for assistance.
```

it means you have provided a video or audio that cannot be seeked to an arbitrary time. The cause for this is that when requesting the audio file, no `Content-Range` HTTP header has been sent by the server, making it impossible for the browser and therefore for Remotion to seek the media.

## Reproduction

You can verify that this is the problem by opening the video or audio in a new tab and observe that you cannot seek the media.

So far, this behavior has been observed when serving media from a private Google Cloud Storage bucket.

## Solution

To fix this problem, you need to serve the media from a webhost that supports the `Range` header.

Alternatively, you can download the media and import it locally using an `import` or `require()` statement.
