import { Ellipse } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const EllipseDemo: React.FC<{
  darkMode: boolean;
  rx: number;
  ry: number;
}> = ({ rx, ry, darkMode }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ellipse
        fill={darkMode ? "white" : "var(--ifm-link-color)"}
        rx={rx}
        ry={ry}
      />
    </AbsoluteFill>
  );
};
