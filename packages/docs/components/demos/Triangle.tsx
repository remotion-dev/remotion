import { Triangle } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const TriangleDemo: React.FC<{
  length: number;
  edgeRoundness: number;
  darkMode: boolean;
}> = ({ length, edgeRoundness, darkMode }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Triangle
        fill={darkMode ? "white" : "#222"}
        edgeRoundness={edgeRoundness}
        direction="up"
        length={length}
      />
    </AbsoluteFill>
  );
};
