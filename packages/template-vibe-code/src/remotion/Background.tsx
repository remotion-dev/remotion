import React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const Background: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Background"
      style={{
        background: "linear-gradient(160deg, #0b1020 0%, #111a33 60%, #0b1020)",
      }}
    >
      <Interactive.Div
        name="Glow"
        style={{
          position: "absolute",
          width: 640,
          height: 640,
          left: 760,
          top: -160,
          borderRadius: "50%",
          backgroundColor: accent,
          opacity: 0.35,
          filter: "blur(80px)",
          translate: interpolate(
            frame,
            [0, durationInFrames],
            ["0px 0px", "-120px 90px"],
            {
              easing: Easing.inOut(Easing.sin),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      />
      <Interactive.Div
        name="Grid"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};
