import { Pie } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const PieDemo: React.FC<{
  radius: number;
  darkMode: boolean;
  fillAmount: number;
  closePath: boolean;
  stroke: boolean;
}> = ({ radius, darkMode, fillAmount, closePath, stroke }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pie
        fillAmount={fillAmount}
        fill={
          stroke ? "transparent" : darkMode ? "white" : "var(--ifm-link-color)"
        }
        radius={radius}
        closePath={closePath}
        stroke={darkMode ? "white" : "var(--ifm-link-color)"}
        strokeWidth={stroke ? 5 : 0}
      />
    </AbsoluteFill>
  );
};
