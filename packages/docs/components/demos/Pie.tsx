import { Pie } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const PieDemo: React.FC<{
  radius: number;
  darkMode: boolean;
  fillAmount: number;
}> = ({ radius, darkMode, fillAmount }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pie
        fillAmount={fillAmount}
        fill={darkMode ? "white" : "var(--ifm-link-color)"}
        radius={radius}
      />
    </AbsoluteFill>
  );
};
