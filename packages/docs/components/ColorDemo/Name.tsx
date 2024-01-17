import { interpolateStyles, translateY } from "@remotion/animation-utils";
import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { defaultStyles } from "./styles";

export const Name: React.FC<{
  name: string;
}> = ({ name }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const progress = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });
  return (
    <AbsoluteFill
      style={{
        ...defaultStyles,
        backgroundColor: "white",
        color: "black",
      }}
    >
      <div
        style={interpolateStyles(
          progress,
          [0, 1],
          [
            { transform: translateY(1000), opacity: 1 },
            { transform: translateY(0), opacity: 0 },
          ],
        )}
      >
        <span
          style={{
            display: "block",
            lineHeight: 1.1,
          }}
        >
          Hi {name || "there"}!
        </span>
        <span
          style={{
            display: "block",
            lineHeight: 1.1,
          }}
        >
          Your favorite color is
        </span>
      </div>
    </AbsoluteFill>
  );
};
