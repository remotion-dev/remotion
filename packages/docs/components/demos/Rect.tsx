import { Rect } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const RectDemo: React.FC<{
  width: number;
  height: number;
  edgeRoundness: number;
  darkMode: boolean;
  debug: boolean;
}> = ({ width, height, debug, edgeRoundness, darkMode }) => {
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
      />
    </AbsoluteFill>
  );
};
