import { Interactive, useCurrentFrame, useVideoConfig } from "remotion";

type AnimatedBackgroundProps = {
  color?: string;
  backgroundColor?: string;
};

const AnimatedBackgroundInner = ({
  color = "#e3a253",
  backgroundColor = "#fff2dd",
}: AnimatedBackgroundProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor,
        backgroundImage: `linear-gradient(${color} 4px, transparent 4px), linear-gradient(90deg, ${color} 4px, transparent 4px)`,
        backgroundSize: "120px 120px",
        backgroundPosition: `${(frame / durationInFrames) * 120}px ${(frame / durationInFrames) * 120}px`,
      }}
    />
  );
};

export const AnimatedBackground = Interactive.create({
  Component: AnimatedBackgroundInner,
  layout: "absolute-fill",
  schema: {
    color: { type: "color", default: "#e3a253", description: "Grid color" },
    backgroundColor: {
      type: "color",
      default: "#fff2dd",
      description: "Background color",
    },
  },
});
