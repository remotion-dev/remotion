import { ThreeCanvas, ThreeCanvasRef } from "@remotion/three";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Phone } from "./Phone";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { MediabunnyMetadata } from "./helpers/get-media-metadata";
import { Video } from "@remotion/media";
import { CanvasTexture, Texture } from "three";
import { getPhoneLayout } from "./helpers/layout";

const container: React.CSSProperties = {
  backgroundColor: "white",
};

const videoStyle: React.CSSProperties = {
  position: "absolute",
  opacity: 0,
};

export const myCompSchema = z.object({
  phoneColor: zColor(),
  deviceType: z.enum(["phone", "tablet"]),
});

type MyCompSchemaType = z.infer<typeof myCompSchema>;

export const Scene: React.FC<
  {
    readonly baseScale: number;
    mediaMetadata: MediabunnyMetadata | null;
    videoSrc: string | null;
  } & MyCompSchemaType
> = ({ baseScale, phoneColor, mediaMetadata, videoSrc }) => {
  const { width, height } = useVideoConfig();

  if (!mediaMetadata) {
    throw new Error("Media metadata is not supported yet");
  }
  if (!videoSrc) {
    throw new Error("Video source is not supported yet");
  }

  const [canvasTexture] = useState(() => {
    return new OffscreenCanvas(
      mediaMetadata.dimensions.width,
      mediaMetadata.dimensions.height,
    );
  });

  const [context] = useState(() => {
    const context = canvasTexture.getContext("2d");
    if (!context) {
      throw new Error("Failed to get context");
    }
    return context;
  });

  const threeCanvasRef = useRef<ThreeCanvasRef>(null);

  const aspectRatio = useMemo(
    () => mediaMetadata.dimensions.width / mediaMetadata.dimensions.height,
    [mediaMetadata.dimensions.width, mediaMetadata.dimensions.height],
  );

  const layout = useMemo(
    () => getPhoneLayout(aspectRatio, baseScale),
    [aspectRatio, baseScale],
  );

  const [texture] = useState<Texture>(() => {
    const tex = new CanvasTexture(canvasTexture);
    tex.repeat.y = 1 / layout.screen.height;
    tex.repeat.x = 1 / layout.screen.width;
    return tex;
  });

  const onVideoFrame = useCallback(
    (frame: CanvasImageSource) => {
      context.drawImage(frame, 0, 0);
      texture.needsUpdate = true;
      threeCanvasRef.current?.invalidate();
    },
    [context, texture],
  );

  return (
    <AbsoluteFill style={container}>
      <Video src={videoSrc} style={videoStyle} onVideoFrame={onVideoFrame} />
      <ThreeCanvas ref={threeCanvasRef} linear width={width} height={height}>
        <ambientLight intensity={1.5} color={0xffffff} />
        <pointLight position={[10, 10, 0]} />
        <Phone
          phoneColor={phoneColor}
          phoneLayout={layout}
          videoTexture={texture}
        />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
