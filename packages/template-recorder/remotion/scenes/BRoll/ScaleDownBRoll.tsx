import React, { useMemo } from "react";
import { Img, interpolate, OffthreadVideo, useVideoConfig } from "remotion";
import type { BRollWithDimensions } from "../../../config/scenes";
import { fitElementSizeInContainer } from "../../layout/fit-element";
import type {
  BRollEnterDirection,
  Layout,
  Rect,
} from "../../layout/layout-types";
import { ScaleDownIfBRollRequiresIt } from "./ScaleDownWithBRoll";

export const ScaleDownBRoll: React.FC<{
  bRollEnterDirection: BRollEnterDirection;
  bRoll: BRollWithDimensions;
  bRollsBefore: BRollWithDimensions[];
  bRollLayout: Layout;
  sceneFrame: number;
  appearProgress: number;
  disappearProgress: number;
}> = ({
  bRollEnterDirection,
  bRollLayout,
  sceneFrame,
  bRoll,
  bRollsBefore,
  appearProgress,
  disappearProgress,
}) => {
  const { height: canvasHeight } = useVideoConfig();

  const bRollContainer: Layout = useMemo(() => {
    return {
      ...bRollLayout,
      display: "flex",
    };
  }, [bRollLayout]);

  const enterPosition = useMemo(() => {
    if (bRollEnterDirection === "top") {
      return -bRollLayout.height;
    }

    if (bRollEnterDirection === "bottom") {
      return canvasHeight;
    }

    throw new Error(`Invalid direction ${bRollEnterDirection}`);
  }, [bRollEnterDirection, bRollLayout.height, canvasHeight]);

  const topOffset = interpolate(
    appearProgress - disappearProgress,
    [0, 1],
    [enterPosition, bRollLayout.top],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const outerStyle: React.CSSProperties = useMemo(() => {
    return {
      ...bRollContainer,
      position: "absolute",
      top: topOffset,
      justifyContent: "center",
      alignItems: "center",
    };
  }, [bRollContainer, topOffset]);

  const biggestLayout: Rect = useMemo(() => {
    return fitElementSizeInContainer({
      containerSize: bRollLayout,
      elementSize: {
        height: bRoll.assetHeight,
        width: bRoll.assetWidth,
      },
    });
  }, [bRoll.assetHeight, bRoll.assetWidth, bRollLayout]);

  const style = useMemo(() => {
    return {
      borderRadius: bRollLayout.borderRadius,
      overflow: "hidden",
      boxShadow: "0 0 50px rgba(0, 0, 0, 0.2)",
      height: biggestLayout.height,
      width: biggestLayout.width,
      aspectRatio: bRoll.assetWidth / bRoll.assetHeight,
    };
  }, [
    bRoll.assetHeight,
    bRoll.assetWidth,
    bRollLayout.borderRadius,
    biggestLayout.height,
    biggestLayout.width,
  ]);

  return (
    <div style={outerStyle}>
      <ScaleDownIfBRollRequiresIt
        frame={sceneFrame}
        bRolls={bRollsBefore}
        bRollType={"scale"}
      >
        {bRoll.type === "image" ? (
          <Img src={bRoll.source} style={style} />
        ) : null}
        {bRoll.type === "video" ? (
          <OffthreadVideo src={bRoll.source} muted style={style} />
        ) : null}
      </ScaleDownIfBRollRequiresIt>
    </div>
  );
};
