import { Polygon } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const PolygonDemo: React.FC<{
  readonly darkMode: boolean;
  readonly points: number;
  readonly radius: number;
  readonly cornerRadius: number;
  readonly edgeRoundness: number | null;
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
