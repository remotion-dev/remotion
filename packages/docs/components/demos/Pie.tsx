import { Pie } from "@remotion/shapes";
import React from "react";
import { AbsoluteFill } from "remotion";

export const PieDemo: React.FC<{
  readonly radius: number;
  readonly darkMode: boolean;
  readonly progress: number;
  readonly closePath: boolean;
  readonly showStrokeInsteadPreviewOnly: boolean;
  readonly counterClockwise: boolean;
  readonly rotation: number;
}> = ({
  radius,
  darkMode,
  progress,
  closePath,
  showStrokeInsteadPreviewOnly,
  counterClockwise,
  rotation,
}) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pie
        progress={progress}
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
        counterClockwise={counterClockwise}
        rotation={rotation}
      />
    </AbsoluteFill>
  );
};
