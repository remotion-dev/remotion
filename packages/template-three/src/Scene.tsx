import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Phone } from "./Phone";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { MediabunnyMetadata } from "./helpers/get-media-metadata";
import { getPhoneLayout } from "./helpers/layout";

const container: React.CSSProperties = {
  backgroundColor: "white",
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
    throw new Error("Media metadata is not available");
  }
  if (!videoSrc) {
    throw new Error("Video source is not available");
  }

  const aspectRatio = useMemo(
    () => mediaMetadata.dimensions.width / mediaMetadata.dimensions.height,
    [mediaMetadata.dimensions.width, mediaMetadata.dimensions.height],
  );

  const layout = useMemo(
    () => getPhoneLayout(aspectRatio, baseScale),
    [aspectRatio, baseScale],
  );

  return (
    <AbsoluteFill style={container}>
      <ThreeCanvas linear width={width} height={height}>
        <ambientLight intensity={1.5} color={0xffffff} />
        <pointLight position={[10, 10, 0]} />
        <Phone
          phoneColor={phoneColor}
          phoneLayout={layout}
          mediaMetadata={mediaMetadata}
          videoSrc={videoSrc}
        />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
