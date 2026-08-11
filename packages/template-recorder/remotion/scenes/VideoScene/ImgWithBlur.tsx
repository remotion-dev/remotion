import React, { useMemo } from "react";
import type { ImgProps } from "remotion";
import { AbsoluteFill, Img } from "remotion";
import type { Dimensions } from "../../../config/layout";
import { getBlurLayout } from "../../layout/blur";
import type { Layout } from "../../layout/layout-types";

// An image that if it cannot fill out the canvas, will have a background-blurred replica
export const ImgWithBlur: React.FC<
  {
    containerLayout: Layout;
    imageSize: Dimensions;
  } & Omit<ImgProps, "style">
> = ({ containerLayout, imageSize, ...props }) => {
  const { innerStyle, needsBlur, outerStyle, blurStyle } = useMemo(() => {
    return getBlurLayout({
      containerLayout,
      assetSize: imageSize,
    });
  }, [containerLayout, imageSize]);

  return (
    <AbsoluteFill style={outerStyle}>
      {needsBlur ? <Img style={blurStyle} {...props} /> : null}
      <Img style={innerStyle} {...props} />
    </AbsoluteFill>
  );
};
