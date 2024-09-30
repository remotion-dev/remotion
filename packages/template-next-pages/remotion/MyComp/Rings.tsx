import React from "react";
import { AbsoluteFill, interpolateColors, useVideoConfig } from "remotion";

const RadialGradient: React.FC<{
  radius: number;
  color: string;
}> = ({ radius, color }) => {
  const height = radius * 2;
  const width = radius * 2;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          height,
          width,
          borderRadius: "50%",
          backgroundColor: color,
          position: "absolute",
          boxShadow: "0 0 100px rgba(0, 0, 0, 0.05)",
        }}
      ></div>
    </AbsoluteFill>
  );
};

export const Rings: React.FC<{
  outProgress: number;
}> = ({ outProgress }) => {
  const scale = 1 / (1 - outProgress);
  const { height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
      }}
    >
      {new Array(5)
        .fill(true)
        .map((_, i) => {
          return (
            <RadialGradient
              key={i}
              radius={height * 0.3 * i}
              color={interpolateColors(i, [0, 4], ["#fff", "#fff"])}
            />
          );
        })
        .reverse()}
    </AbsoluteFill>
  );
};
