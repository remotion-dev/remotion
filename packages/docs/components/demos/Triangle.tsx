import type { TriangleProps } from "@remotion/shapes";
import { Triangle } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const TriangleDemo: React.FC<{
  readonly length: number;
  readonly edgeRoundness: number;
  readonly darkMode: boolean;
  readonly direction: TriangleProps["direction"];
  readonly debug: boolean;
  readonly cornerRadius: number;
}> = ({ length, edgeRoundness, debug, direction, cornerRadius, darkMode }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Triangle
        fill={darkMode ? "white" : "var(--ifm-link-color)"}
        edgeRoundness={edgeRoundness}
        direction={direction}
        length={length}
        debug={debug}
        cornerRadius={cornerRadius}
      />
    </AbsoluteFill>
  );
};
