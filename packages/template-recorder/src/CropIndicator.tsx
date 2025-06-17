import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type { Dimensions } from "../config/layout";
import { fitElementSizeInContainer } from "../remotion/layout/fit-element";
import { useElementSize } from "./helpers/use-element-size";

export const CropIndicator: React.FC<{
  resolution: Dimensions;
}> = ({ resolution }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const elementSize = useElementSize(ref);

  const videoSize = useMemo(() => {
    return elementSize
      ? fitElementSizeInContainer({
          containerSize: elementSize,
          elementSize: resolution,
        })
      : null;
  }, [elementSize, resolution]);

  const cropIndicatorRect = useMemo(() => {
    return videoSize
      ? fitElementSizeInContainer({
          containerSize: videoSize,
          elementSize: {
            width: 350,
            height: 400,
          },
        })
      : null;
  }, [videoSize]);

  const cropIndicator: React.CSSProperties = useMemo(() => {
    return {
      border: "2px solid #F7D449",
      borderRadius: 10,
      ...cropIndicatorRect,
    };
  }, [cropIndicatorRect]);

  return (
    <AbsoluteFill ref={ref}>
      <AbsoluteFill style={videoSize ?? undefined}>
        <AbsoluteFill style={cropIndicator} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
