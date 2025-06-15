import { Heart } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const HeartDemo: React.FC<{
  readonly darkMode: boolean;
  readonly size: number;
}> = ({ size, darkMode }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Heart
        fill={darkMode ? "white" : "var(--ifm-link-color)"}
        size={size}
      />
    </AbsoluteFill>
  );
};