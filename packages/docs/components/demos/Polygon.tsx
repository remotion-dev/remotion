import { Polygon } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const PolygonDemo: React.FC<{
  darkMode: boolean;
  points: number;
  radius: number;
  cornerRadius: number;
  edgeRoundness: number | null;
}> = ({ points, radius, darkMode, cornerRadius, edgeRoundness }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Polygon
        fill={darkMode ? "white" : "var(--ifm-link-color)"}
        points={points}
        radius={radius}
        cornerRadius={cornerRadius}
        edgeRoundness={edgeRoundness}
      />
    </AbsoluteFill>
  );
};
