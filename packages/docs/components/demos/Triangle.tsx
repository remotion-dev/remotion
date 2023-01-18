import { Triangle } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const TriangleDemo: React.FC<{
  length: number;
  edgeRoundness: number;
}> = ({ length, edgeRoundness }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Triangle edgeRoundness={edgeRoundness} direction="up" length={length} />
    </AbsoluteFill>
  );
};
