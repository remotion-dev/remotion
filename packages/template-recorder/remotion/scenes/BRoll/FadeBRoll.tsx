import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type { BRollWithDimensions } from "../../../config/scenes";
import type { Layout } from "../../layout/layout-types";
import { ImgWithBlur } from "../VideoScene/ImgWithBlur";
import { VideoWithBlur } from "../VideoScene/VideoWithBlur";

export const Fade: React.FC<{
  appearProgress: number;
  disappearProgress: number;
  children: React.ReactNode;
}> = ({ appearProgress, disappearProgress, children }) => {
  const style: React.CSSProperties = useMemo(() => {
    return {
      opacity: appearProgress - disappearProgress,
    };
  }, [appearProgress, disappearProgress]);

  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const FadeBRoll: React.FC<{
  bRoll: BRollWithDimensions;
  layout: Layout;
}> = ({ bRoll, layout }) => {
  const assetSize = useMemo(() => {
    return {
      height: bRoll.assetHeight,
      width: bRoll.assetWidth,
    };
  }, [bRoll.assetHeight, bRoll.assetWidth]);

  if (bRoll.type === "image") {
    return (
      <ImgWithBlur
        src={bRoll.source}
        containerLayout={layout}
        imageSize={assetSize}
      />
    );
  }

  if (bRoll.type === "video") {
    return (
      <VideoWithBlur
        src={bRoll.source}
        muted
        containerLayout={layout}
        videoSize={assetSize}
        enableBlur
      />
    );
  }

  throw new Error(`Invalid b-roll type ${bRoll.type satisfies never}`);
};
