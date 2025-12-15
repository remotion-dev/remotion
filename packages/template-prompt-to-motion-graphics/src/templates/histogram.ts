import { RemotionExample } from "./index";

export const histogramCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { Rect } from "@remotion/shapes";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const data = [
    { label: "Mon", value: 65, color: "#6366f1" },
    { label: "Tue", value: 85, color: "#8b5cf6" },
    { label: "Wed", value: 45, color: "#a855f7" },
    { label: "Thu", value: 95, color: "#d946ef" },
    { label: "Fri", value: 75, color: "#ec4899" },
  ];

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = 80;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "flex-end",
        padding: 60,
        paddingBottom: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 24,
          height: 400,
          width: "100%",
          justifyContent: "center",
        }}
      >
        {data.map((item, i) => {
          const delay = i * 10;
          const progress = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15, stiffness: 100 },
          });

          const height = Math.max(1, (item.value / maxValue) * 300 * progress);

          return (
            <div key={i} style={{ textAlign: "center", position: "relative" }}>
              <div style={{ position: "relative", height, width: barWidth }}>
                <Rect
                  width={barWidth}
                  height={height}
                  fill={item.color}
                  cornerRadius={12}
                  style={{ filter: \`drop-shadow(0 0 8px \${item.color}50)\` }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "bold",
                    opacity: progress,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {Math.round(item.value * progress)}
                </span>
              </div>
              <div
                style={{
                  color: "#888",
                  fontSize: 16,
                  marginTop: 12,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};`;

export const histogramExample: RemotionExample = {
  id: "histogram",
  name: "Histogram",
  description: "Animated bar chart using @remotion/shapes",
  category: "Charts",
  durationInFrames: 120,
  fps: 30,
  code: histogramCode,
};
