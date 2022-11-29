---
image: /generated/articles-docs-video-manipulation.png
id: video-manipulation
title: Video manipulation
crumb: "How To"
---

import { VideoCanvasExamples } from "../components/GreenscreenExamples/index";

You can manipulate a video buffer by rendering a [`<Video>`](/docs/video) onto a `<canvas>` element using the [`drawImage()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage) API and keeping it in sync using the [`requestVideoFrameCallback()`](https://blog.tomayac.com/2020/05/15/the-requestvideoframecallback-api/) API.

:::note
This API currently [only works in Chrome](https://caniuse.com/mdn-api_htmlvideoelement_requestvideoframecallback).
:::

## Basic example

In this example, a Video is rendered and made invisible. Then it is rendered onto a Canvas and a grayscale [`filter`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) is applied.

<VideoCanvasExamples type="base"/>
<br/>

```tsx twoslash
import React, { useCallback, useEffect, useRef } from "react";
import { AbsoluteFill, useVideoConfig, Video } from "remotion";
declare global {
  interface VideoFrameMetadata {
    presentationTime: DOMHighResTimeStamp;
    expectedDisplayTime: DOMHighResTimeStamp;
    width: number;
    height: number;
    mediaTime: number;
    presentedFrames: number;
    processingDuration?: number;
    captureTime?: DOMHighResTimeStamp;
    receiveTime?: DOMHighResTimeStamp;
    rtpTimestamp?: number;
  }
  type VideoFrameRequestCallbackId = number;
  interface HTMLVideoElement extends HTMLMediaElement {
    requestVideoFrameCallback(
      callback: (now: DOMHighResTimeStamp, metadata: VideoFrameMetadata) => any
    ): VideoFrameRequestCallbackId;
    cancelVideoFrameCallback(handle: VideoFrameRequestCallbackId): void;
  }
}
// ---cut---
export const VideoOnCanvas: React.FC = () => {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { width, height } = useVideoConfig();

  // Process a frame
  const onVideoFrame = useCallback(() => {
    if (!canvas.current || !video.current) {
      return;
    }
    const context = canvas.current.getContext("2d");

    if (!context) {
      return;
    }

    context.filter = "grayscale(100%)";
    context.drawImage(video.current, 0, 0, width, height);
  }, [height, width]);

  // Synchronize the video with the canvas
  useEffect(() => {
    const { current } = video;
    if (!current?.requestVideoFrameCallback) {
      return;
    }

    let handle = 0;
    const callback = () => {
      onVideoFrame();
      handle = current.requestVideoFrameCallback(callback);
    };

    callback();

    return () => {
      current.cancelVideoFrameCallback(handle);
    };
  }, [onVideoFrame]);

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Video
          ref={video}
          // Hide the original video tag
          style={{ opacity: 0 }}
          startFrom={300}
          src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        />
      </AbsoluteFill>
      <AbsoluteFill>
        <canvas ref={canvas} width={width} height={height} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

## Greenscreen example

In this example, we loop over each pixel in the image buffer and if it's green, we transparentize it. Drag the slider below to turn the video transparent.

<VideoCanvasExamples type="greenscreen"/>
<br/>

```tsx twoslash
declare global {
  interface VideoFrameMetadata {
    presentationTime: DOMHighResTimeStamp;
    expectedDisplayTime: DOMHighResTimeStamp;
    width: number;
    height: number;
    mediaTime: number;
    presentedFrames: number;
    processingDuration?: number;
    captureTime?: DOMHighResTimeStamp;
    receiveTime?: DOMHighResTimeStamp;
    rtpTimestamp?: number;
  }
  type VideoFrameRequestCallbackId = number;
  interface HTMLVideoElement extends HTMLMediaElement {
    requestVideoFrameCallback(
      callback: (now: DOMHighResTimeStamp, metadata: VideoFrameMetadata) => any
    ): VideoFrameRequestCallbackId;
    cancelVideoFrameCallback(handle: VideoFrameRequestCallbackId): void;
  }
}
import React, { useCallback, useEffect, useRef } from "react";
import { AbsoluteFill, useVideoConfig, Video } from "remotion";

// ---cut---
export const Greenscreen: React.FC<{
  opacity: number;
}> = ({ opacity }) => {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { width, height } = useVideoConfig();

  // Process a frame
  const onVideoFrame = useCallback(
    (opacity: number) => {
      if (!canvas.current || !video.current) {
        return;
      }
      const context = canvas.current.getContext("2d");

      if (!context) {
        return;
      }

      context.drawImage(video.current, 0, 0, width, height);
      const imageFrame = context.getImageData(0, 0, width, height);
      const { length } = imageFrame.data;

      // If the pixel is very green, reduce the alpha channel
      for (let i = 0; i < length; i += 4) {
        const red = imageFrame.data[i + 0];
        const green = imageFrame.data[i + 1];
        const blue = imageFrame.data[i + 2];
        if (green > 100 && red < 100 && blue < 100) {
          imageFrame.data[i + 3] = opacity * 255;
        }
      }
      context.putImageData(imageFrame, 0, 0);
    },
    [height, width]
  );

  useEffect(() => {
    const { current } = video;
    if (!current || !current.requestVideoFrameCallback) {
      return;
    }
    let handle = 0;
    const callback = () => {
      onVideoFrame(opacity);
      handle = current.requestVideoFrameCallback(callback);
    };

    callback();

    return () => {
      current.cancelVideoFrameCallback(handle);
    };
  }, [onVideoFrame, opacity]);

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Video
          ref={video}
          style={{ opacity: 0 }}
          startFrom={300}
          // If we access the data of a remote video, we must add this prop, and the remote video must have CORS enabled
          crossOrigin="anonymous"
          src="https://remotion-assets.s3.eu-central-1.amazonaws.com/just-do-it.mp4"
        />
      </AbsoluteFill>
      <AbsoluteFill>
        <canvas ref={canvas} width={width} height={height} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

## TypeScript issues

In our experience, the types for `requestVideoFrameCallback` and `cancelVideoFrameCallback` are missing or wrong by default. Install the newest version for [`@types/web`](https://www.npmjs.com/package/@types/web)
or add a `// @ts-expect-error` comment to suppress the errors.
