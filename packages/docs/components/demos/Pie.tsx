import { Pie } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const PieDemo: React.FC<{
  radius: number;
  darkMode: boolean;
  fillAmount: number;
  closePath: boolean;
  showStrokeInsteadPreviewOnly: boolean;
}> = ({
  radius,
  darkMode,
  fillAmount,
  closePath,
  showStrokeInsteadPreviewOnly,
}) => {
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
          showStrokeInsteadPreviewOnly
            ? "transparent"
            : darkMode
            ? "white"
            : "var(--ifm-link-color)"
        }
        radius={radius}
        closePath={closePath}
        stroke={darkMode ? "white" : "var(--ifm-link-color)"}
        strokeWidth={showStrokeInsteadPreviewOnly ? 5 : 0}
      />
    </AbsoluteFill>
  );
};
