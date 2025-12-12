import { Html5Video, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import React, { useEffect, useRef, useState } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Phone } from "./Phone";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useTexture } from "./use-texture";
import { getMediaMetadata } from "./helpers/get-media-metadata";

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
  } & MyCompSchemaType
> = ({ baseScale, phoneColor, deviceType }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { width, height } = useVideoConfig();
  const [videoData, setVideoData] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const videoSrc =
    deviceType === "phone" ? staticFile("phone.mp4") : staticFile("tablet.mp4");

  useEffect(() => {
    getMediaMetadata(videoSrc)
      .then((data) => setVideoData(data.dimensions))
      .catch((err) => console.log(err));
  }, [videoSrc]);

  const texture = useTexture(videoSrc, videoRef);

  return (
    <AbsoluteFill style={container}>
      <Html5Video
        ref={videoRef}
        src={videoSrc}
        style={videoStyle}
        pauseWhenBuffering
      />
      {videoData ? (
        <ThreeCanvas linear width={width} height={height}>
          <ambientLight intensity={1.5} color={0xffffff} />
          <pointLight position={[10, 10, 0]} />
          <Phone
            phoneColor={phoneColor}
            baseScale={baseScale}
            videoTexture={texture}
            aspectRatio={videoData.width / videoData.height}
          />
        </ThreeCanvas>
      ) : null}
    </AbsoluteFill>
  );
};
