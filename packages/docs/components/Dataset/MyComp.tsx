import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Props {
  readonly name: string;
  readonly logo: string;
  readonly repo: string;
}

export const MyComp: React.FC<Props> = ({ name, repo, logo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - 10,
    config: {
      damping: 100,
    },
  });

  const opacity = interpolate(frame, [30, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const moveY = interpolate(frame, [20, 30], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        scale: String(scale),
        backgroundColor: "white",
        fontWeight: "bold",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Img
          src={logo}
          style={{
            height: 80,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "black",
          }}
        >
          <div
            style={{
              fontSize: 40,
              transform: `translateY(${moveY}px)`,
              lineHeight: 1,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 20,
              opacity,
              lineHeight: 1.25,
            }}
          >
            {repo}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
