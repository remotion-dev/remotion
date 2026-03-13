import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const HelloWorld: React.FC<{
  titleText: string;
}> = ({titleText}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({
    fps,
    frame,
    config: {
      damping: 14,
      stiffness: 120,
    },
  });
  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020617",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          width: 980,
          padding: 48,
          borderRadius: 32,
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8))",
          boxShadow: "0 30px 80px rgba(15, 23, 42, 0.5)",
          textAlign: "center",
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#38bdf8",
            marginBottom: 24,
          }}
        >
          Remotion + Electron
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#e2e8f0",
          }}
        >
          {titleText}
        </div>
      </div>
    </AbsoluteFill>
  );
};
