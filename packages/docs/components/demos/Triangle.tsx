import type { TriangleProps } from "@remotion/shapes";
import { Triangle } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const TriangleDemo: React.FC<{
  length: number;
  edgeRoundness: number;
  darkMode: boolean;
  direction: TriangleProps["direction"];
}> = ({ length, edgeRoundness, direction, darkMode }) => {
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
      />
    </AbsoluteFill>
  );
};
