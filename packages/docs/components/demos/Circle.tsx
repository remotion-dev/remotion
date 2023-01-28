import { Circle } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const CircleDemo: React.FC<{
  radius: number;
  darkMode: boolean;
}> = ({ radius, darkMode }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Circle
        strokeWidth={5}
        stroke={darkMode ? "white" : "var(--ifm-link-color)"}
        radius={radius}
      />
    </AbsoluteFill>
  );
};
