import { useState } from "react";
import { random, useVideoConfig } from "remotion";
import { COLOR_1, COLOR_2 } from "./constants";

const getCircumferenceOfArc = (rx, ry) => {
  return Math.PI * 2 * Math.sqrt((rx * rx + ry * ry) / 2);
};

const rx = 135;
const ry = 300;
const cx = 960;
const cy = 540;
const arcLength = getCircumferenceOfArc(rx, ry);
const strokeWidth = 30;

export const Arc = ({ progress, rotation, rotateProgress }) => {
  const { width, height } = useVideoConfig();

  // Each svg Id must be unique to not conflict with each other
  const [gradientId] = useState(() => String(random(null)));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: "absolute",
        transform: `rotate(${rotation * rotateProgress}deg)`,
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLOR_1} />
          <stop offset="100%" stopColor={COLOR_2} />
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
