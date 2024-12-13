import { Easing, useVideoConfig } from "remotion";
import { interpolate } from "remotion";
import React from "react";
import { Caption } from "@remotion/captions";

export const Word: React.FC<{
  readonly item: Caption;
  readonly frame: number;
  readonly transcriptionColor: string;
}> = ({ item, frame, transcriptionColor }) => {
  const { fps } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [(item.startMs / 1000) * fps, (item.startMs / 1000) * fps + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const translateY = interpolate(
    frame,
    [(item.startMs / 1000) * fps, (item.startMs / 1000) * fps + 10],
    [0.25, 0],
    {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        translate: `0 ${translateY}em`,
        color: transcriptionColor,
      }}
    >
      {item.text}
    </span>
  );
};
