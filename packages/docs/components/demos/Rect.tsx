import { Rect } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const RectDemo: React.FC<{
  readonly width: number;
  readonly height: number;
  readonly edgeRoundness: number;
  readonly darkMode: boolean;
  readonly debug: boolean;
  readonly cornerRadius: number;
}> = ({ width, height, debug, edgeRoundness, cornerRadius, darkMode }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Rect
        fill={darkMode ? "white" : "var(--ifm-link-color)"}
        edgeRoundness={edgeRoundness}
        width={width}
        height={height}
        debug={debug}
        cornerRadius={cornerRadius}
      />
    </AbsoluteFill>
  );
};
