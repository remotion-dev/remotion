import { RemotionExample } from "./index";

export const counterAnimationCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const metrics = [
    { label: "Users", target: 10000, color: "#4f46e5" },
    { label: "Revenue", target: 50000, prefix: "$", color: "#10b981" },
    { label: "Growth", target: 127, suffix: "%", color: "#f59e0b" },
  ];

  const progress = interpolate(
    frame,
    [0, durationInFrames * 0.7],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f0f",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 60,
        }}
      >
        {metrics.map((metric, i) => {
          const staggeredProgress = interpolate(
            progress,
            [i * 0.15, i * 0.15 + 0.7],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const value = Math.round(metric.target * staggeredProgress);

          return (
            <div
              key={i}
              style={{
                textAlign: "center",
                opacity: interpolate(staggeredProgress, [0, 0.2], [0, 1]),
                transform: \`translateY(\${(1 - staggeredProgress) * 20}px)\`,
                minWidth: 200,
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: "bold",
                  color: metric.color,
                  fontFamily: "system-ui, sans-serif",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {metric.prefix || ""}{value.toLocaleString()}{metric.suffix || ""}
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: "#888",
                  marginTop: 8,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {metric.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};`;

export const counterAnimationExample: RemotionExample = {
  id: "counter-animation",
  name: "Counter Animation",
  description: "Animated number counters with metrics",
  category: "Charts",
  durationInFrames: 150,
  fps: 30,
  code: counterAnimationCode,
};
