import { Star } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const StarDemo: React.FC<{
  darkMode: boolean;
  innerRadius: number;
  outerRadius: number;
}> = ({ innerRadius, outerRadius, darkMode }) => {
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
        points={5}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
      />
    </AbsoluteFill>
  );
};
