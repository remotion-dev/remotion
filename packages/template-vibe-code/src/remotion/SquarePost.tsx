import React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SquarePost: React.FC<{ headline: string; color: string }> = ({
  headline,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        color: "white",
        fontFamily: "sans-serif",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Interactive.Div
        name="Circle"
        style={{
          position: "absolute",
          width: 720,
          height: 720,
          borderRadius: "50%",
          backgroundColor: color,
          scale: interpolate(frame, [0, fps], [0, 1], {
            easing: Easing.out(Easing.back(1.2)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          rotate: interpolate(frame, [0, durationInFrames], ["0deg", "90deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          opacity: 0.9,
        }}
      />
      <Interactive.H1
        name="Headline"
        style={{
          position: "relative",
          margin: 0,
          fontSize: 140,
          fontWeight: 900,
          letterSpacing: -6,
          textAlign: "center",
          mixBlendMode: "difference",
          translate: interpolate(frame, [10, 40], ["0px 80px", "0px 0px"], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          opacity: interpolate(frame, [10, 25], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {headline}
      </Interactive.H1>
    </AbsoluteFill>
  );
};
