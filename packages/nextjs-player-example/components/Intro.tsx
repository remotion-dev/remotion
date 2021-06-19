import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arc } from "./Arc";

const container: React.CSSProperties = {
  backgroundColor: "white",
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
};

export const Intro: React.FC<{
  bgColor: string;
  arcColor1: string;
  arcColor2: string;
}> = ({ bgColor, arcColor1, arcColor2 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const scaleProgress = spring({
    fps,
    frame: frame,
    config: {
      mass: 10,
      damping: 200,
    },
  });
  const scale = interpolate(scaleProgress, [0, 1], [1.5, 1]);

  const arcs = (
    <>
      <Arc rotation={0 + 30} delay={0} />
      <Arc rotation={120 + 30} delay={30} />
      <Arc rotation={240 + 30} delay={60} />
    </>
  );

  const opacity = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0]
  );

  return (
    <div
      style={{
        ...container,
        backgroundColor: bgColor,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <svg
        style={{
          width,
          height,
          position: "absolute",
          zIndex: 4,
        }}
      >
        <defs>
          <linearGradient id="lg">
            <stop stopColor={arcColor1} offset="0" />
            <stop stopColor={arcColor2} offset="1" />
          </linearGradient>
          <mask id="mask">{arcs}</mask>
        </defs>
        {arcs}
      </svg>
    </div>
  );
};
