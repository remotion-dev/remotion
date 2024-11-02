import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useThemeColors } from "./calculate-metadata/theme";
import React from "react";

const Step: React.FC<{
  readonly index: number;
  readonly currentStep: number;
  readonly currentStepProgress: number;
}> = ({ index, currentStep, currentStepProgress }) => {
  const themeColors = useThemeColors();

  const outer: React.CSSProperties = useMemo(() => {
    return {
      backgroundColor:
        themeColors.editor.lineHighlightBackground ??
        themeColors.editor.rangeHighlightBackground,
      borderRadius: 6,
      overflow: "hidden",
      height: "100%",
      flex: 1,
    };
  }, [themeColors]);

  const inner: React.CSSProperties = useMemo(() => {
    return {
      height: "100%",
      backgroundColor: themeColors.icon.foreground,
      width:
        index > currentStep
          ? 0
          : index === currentStep
            ? currentStepProgress * 100 + "%"
            : "100%",
    };
  }, [themeColors.icon.foreground, index, currentStep, currentStepProgress]);

  return (
    <div style={outer}>
      <div style={inner} />
    </div>
  );
};

export function ProgressBar({ steps }: { readonly steps: unknown[] }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const stepDuration = durationInFrames / steps.length;
  const currentStep = Math.floor(frame / stepDuration);
  const currentStepProgress = (frame % stepDuration) / stepDuration;

  const container: React.CSSProperties = useMemo(() => {
    return {
      position: "absolute",
      top: 48,
      height: 6,
      left: 0,
      right: 0,
      display: "flex",
      gap: 12,
    };
  }, []);

  return (
    <div style={container}>
      {steps.map((_, index) => (
        <Step
          key={index}
          currentStep={currentStep}
          currentStepProgress={currentStepProgress}
          index={index}
        />
      ))}
    </div>
  );
}
