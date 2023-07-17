---
image: /generated/articles-docs-slow-method-to-extract-frame.png
id: slow-method-to-extract-frame
title: "Slow method to extract frame"
crumb: "Troubleshooting"
---

:::warning
From v4.0 on, this warning does not appear anymore and video frame extraction should always be fast. The information in this document only applies to older versions of Remotion and is preserved for people who are still using them.
:::

When using the [`<OffthreadVideo>`](/docs/offthreadvideo) component, the following warning message may appear:

```
Using a slow method to extract the frame at 1000ms of [video].
```

While it is not an error itself, it warns that the render must do an expensive operation in order to render the video, in which the whole video must be read in order to extract a single frame in it. This warning currently appears in two occasions:

- If a H.264 video in a MP4 container has it's timestamps corrupted so that it cannot be seeked to the exact frame that Remotion wants to extract.

  - **Recommendation**: It might be faster to first re-encode the video using FFMPEG to fix the seeking: `npx remotion ffmpeg -i inputvideo.mp4 outputvideo.mp4`

- If it's a VP8 video in a WebM container and the selected image format is PNG, we cannot accurately extract the frame using FFMPEG and need to resort to the slow method.
  - **Recommendation**: Prefer the VP9 codec instead, or switch the image format to JPEG (in which you will lose transparency however)

## Checking whether a video has this issue

You can use the [getCanExtractFramesFast()](/docs/renderer/get-can-extract-frames-fast)

## See also

- [`<OffthreadVideo>`](/docs/offthreadvideo)
