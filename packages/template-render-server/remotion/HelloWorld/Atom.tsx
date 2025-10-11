import { useState } from "react";
import { random, useVideoConfig } from "remotion";

export const Atom: React.FC<{
  scale: number;
  color1: string;
  color2: string;
}> = ({ scale, color1, color2 }) => {
  const config = useVideoConfig();

  // Each SVG ID must be unique to not conflict with each other
  const [gradientId] = useState(() => String(random(null)));

  return (
    <svg
      viewBox={`0 0 ${config.width} ${config.height}`}
      style={{
        position: "absolute",
        transform: `scale(${scale})`,
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
        cx={config.width / 2}
        cy={config.height / 2}
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
};
