---
id: video-manipulation
title: Video manipulation
---

import { VideoCanvasExamples } from "../components/GreenscreenExamples/index";

You can manipulate a video buffer by rendering it on a Canvas.

## Rendering a video on a Canvas - basic example

<VideoCanvasExamples type="base"/>
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
// ---cut---
import { useVideoConfig, Video } from "remotion";
import { useCallback, useEffect, useRef } from "react";
import React from "react";
import { AbsoluteFill } from "remotion";

export const VideoOnCanvas: React.FC = () => {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { width, height } = useVideoConfig();

  const onVideoFrame = useCallback(() => {
    if (
      !canvas.current ||
      !video.current ||
      !video.current.requestVideoFrameCallback
    ) {
      return;
    }
    const context = canvas.current.getContext("2d");

    if (!context) {
      return;
    }

    context.filter = "grayscale(100%)";
    context.drawImage(video.current, 0, 0, width, height);

    video.current.requestVideoFrameCallback(() => onVideoFrame());
  }, [height, width]);

  useEffect(() => {
    if (!video.current || !video.current.requestVideoFrameCallback) {
      return;
    }
    video.current.requestVideoFrameCallback(() => onVideoFrame());
  }, [onVideoFrame]);

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Video
          ref={video}
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

## Video manipulation example - Greenscreen

<VideoCanvasExamples type="greenscreen"/>
<br/>

```tsx twoslash
import { useVideoConfig, Video } from "remotion";
import { useCallback, useEffect, useRef } from "react";
import React from "react";
import { AbsoluteFill } from "remotion";

// ---cut---
export const Greenscreen: React.FC<{
  opacity: number;
}> = ({ opacity }) => {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { width, height } = useVideoConfig();

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
      handle = current.requestVideoFrameCallback(callback) as unknown as number;
    };

    callback();

    return () => {
      // @ts-expect-error
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

export const VideoOnCanvas: React.FC = () => {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { width, height } = useVideoConfig();

  const onVideoFrame = useCallback(() => {
    if (
      !canvas.current ||
      !video.current ||
      !video.current.requestVideoFrameCallback
    ) {
      return;
    }
    const context = canvas.current.getContext("2d");

    if (!context) {
      return;
    }

    context.filter = "grayscale(100%)";
    context.drawImage(video.current, 0, 0, width, height);

    video.current.requestVideoFrameCallback(() => onVideoFrame());
  }, [height, width]);

  useEffect(() => {
    if (!video.current || !video.current.requestVideoFrameCallback) {
      return;
    }
    video.current.requestVideoFrameCallback(() => onVideoFrame());
  }, [onVideoFrame]);

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Video
          ref={video}
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
