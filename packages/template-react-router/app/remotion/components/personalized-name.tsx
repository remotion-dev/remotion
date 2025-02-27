import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { LogoAnimationProps } from "../constants";

export const PersonalizedName = ({ personalizedName }: LogoAnimationProps) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const progress = spring({
    fps,
    frame: frame - 15,
    config: {
      damping: 200,
    },
  });

  const opacity = interpolate(progress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <span
        style={{
          fontSize: 100,
          color: "black",
          fontFamily: "Founders Grotesk,sans-serif",
          fontWeight: 700,
        }}
      >
        {`Hey ${personalizedName}! `}
      </span>
      <span
        style={{
          fontSize: 100,
          color: "black",
          fontFamily: "Founders Grotesk,sans-serif",
          fontWeight: 700,
        }}
      >
        This is a personalized video for you.
      </span>
    </AbsoluteFill>
  );
};
