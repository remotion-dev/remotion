import { useState } from "react";
import { Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";

const getCircumferenceOfArc = (rx: number, ry: number) => {
  return Math.PI * 2 * Math.sqrt((rx * rx + ry * ry) / 2);
};

const rx = 135;
const ry = 300;
const cx = 315;
const cy = 315;
const arcLength = getCircumferenceOfArc(rx, ry);
const strokeWidth = 30;

export const Arc: React.FC<{
  rotation: number;
  color1: string;
  color2: string;
}> = ({ rotation, color1, color2 }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, fps], [0, 1], {
    easing: Easing.spring({ damping: 100, mass: 0.5 }),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Each svg Id must be unique to not conflict with each other
  const [gradientId] = useState(() => String(random(null)));

  return (
    <svg
      viewBox="0 0 630 630"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        rotate: `${rotation * progress}deg`,
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeDasharray={arcLength}
        strokeDashoffset={arcLength - arcLength * progress}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};
