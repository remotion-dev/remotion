import { useState } from "react";
import { Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";

export const Atom: React.FC<{
  color1: string;
  color2: string;
}> = ({ color1, color2 }) => {
  const { width, height, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Each SVG ID must be unique to not conflict with each other
  const [gradientId] = useState(() => String(random(null)));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: "absolute",
        scale: interpolate(frame, [0, fps], [0, 1], {
          easing: Easing.spring({ damping: 100, mass: 0.5 }),
          output: "perceptual-scale",
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <circle
        r={70}
        cx={width / 2}
        cy={height / 2}
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
};
