import { Star } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const StarDemo: React.FC<{
  darkMode: boolean;
  innerRadius: number;
  outerRadius: number;
  cornerRadius: number;
  edgeRoundness: number | null;
  points: number;
}> = ({
  innerRadius,
  points,
  outerRadius,
  darkMode,
  cornerRadius,
  edgeRoundness,
}) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Star
        fill={darkMode ? "white" : "var(--ifm-link-color)"}
        height={200}
        width={200}
        points={points}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        cornerRadius={cornerRadius}
        edgeRoundness={edgeRoundness}
      />
    </AbsoluteFill>
  );
};
