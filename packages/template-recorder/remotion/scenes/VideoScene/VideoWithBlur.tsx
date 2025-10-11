import React, { useMemo } from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  RemotionOffthreadVideoProps,
} from "remotion";
import type { Dimensions } from "../../../config/layout";
import { getBlurLayout } from "../../layout/blur";
import type { Layout } from "../../layout/layout-types";

// An image that if it cannot fill out the canvas, will have a background-blurred replica
export const VideoWithBlur: React.FC<
  {
    containerLayout: Layout;
    videoSize: Dimensions;
    enableBlur: boolean;
  } & Omit<RemotionOffthreadVideoProps, "style">
> = ({ containerLayout, videoSize, enableBlur, ...props }) => {
  const { innerStyle, needsBlur, outerStyle, blurStyle } = useMemo(() => {
    return getBlurLayout({
      containerLayout,
      assetSize: videoSize,
    });
  }, [containerLayout, videoSize]);

  if (!enableBlur) {
    return (
      <AbsoluteFill>
        <OffthreadVideo
          style={{
            objectFit: "cover",
            ...outerStyle,
            position: "absolute",
          }}
          {...props}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={outerStyle}>
      {needsBlur ? <OffthreadVideo style={blurStyle} {...props} muted /> : null}
      <OffthreadVideo style={innerStyle} {...props} />
    </AbsoluteFill>
  );
};
