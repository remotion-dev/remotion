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
  const glowFilterId = React.useId();
  const gridPatternId = React.useId();

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
          opacity: 0.35,
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
      >
        <svg
          width="calc(100% + 480px)"
          height="calc(100% + 480px)"
          preserveAspectRatio="none"
          style={{ position: "absolute", left: -240, top: -240 }}
        >
          <defs>
            <filter
              id={glowFilterId}
              filterUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur stdDeviation="80" />
            </filter>
          </defs>
          <ellipse
            cx="50%"
            cy="50%"
            rx="calc(50% - 240px)"
            ry="calc(50% - 240px)"
            fill={accent}
            filter={`url(#${glowFilterId})`}
          />
        </svg>
      </Interactive.Div>
      <Interactive.Div
        name="Grid"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.6,
        }}
      >
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <pattern
              id={gridPatternId}
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <rect width="80" height="1" fill="rgba(255,255,255,0.06)" />
              <rect width="1" height="80" fill="rgba(255,255,255,0.06)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
        </svg>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
