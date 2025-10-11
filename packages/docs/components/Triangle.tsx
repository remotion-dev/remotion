import React from "react";

export const Triangle: React.FC<{
  readonly size: number;
  readonly opacity: number;
  readonly color1?: string;
}> = ({ size, opacity, color1 = "#42e9f5" }) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ opacity, transform: `rotate(90deg)` }}
      viewBox="-100 -100 400 400"
    >
      <g stroke={color1} strokeWidth="100" strokeLinejoin="round">
        <path
          fill={color1}
          d="M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
        />
      </g>
    </svg>
  );
};
