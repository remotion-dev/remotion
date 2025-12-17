import { RemotionExample } from "./index";

export const animatedShapesCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Circle, Triangle, Rect, Star } from "@remotion/shapes";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shapes = [
    { type: "circle", color: "#6366f1", delay: 0 },
    { type: "triangle", color: "#10b981", delay: 15 },
    { type: "rect", color: "#f59e0b", delay: 30 },
    { type: "star", color: "#ec4899", delay: 45 },
  ];

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
          gap: 80,
          alignItems: "center",
        }}
      >
        {shapes.map((shape, i) => {
          const entrance = spring({
            frame: frame - shape.delay,
            fps,
            config: { damping: 12, stiffness: 200 },
          });

          const rotation = interpolate(
            frame,
            [0, 180],
            [0, 360],
            { extrapolateRight: "clamp" }
          );

          const bounce = Math.sin((frame - shape.delay) * 0.1) * 10;

          const scale = entrance;
          const opacity = entrance;

          const shapeProps = {
            fill: shape.color,
            stroke: "#fff",
            strokeWidth: 2,
          };

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: \`scale(\${scale}) translateY(\${bounce}px) rotate(\${shape.type === "star" ? rotation : 0}deg)\`,
              }}
            >
              {shape.type === "circle" && (
                <Circle radius={60} {...shapeProps} />
              )}
              {shape.type === "triangle" && (
                <Triangle length={120} direction="up" {...shapeProps} />
              )}
              {shape.type === "rect" && (
                <Rect width={100} height={100} cornerRadius={12} {...shapeProps} />
              )}
              {shape.type === "star" && (
                <Star points={5} innerRadius={40} outerRadius={70} {...shapeProps} />
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};`;

export const animatedShapesExample: RemotionExample = {
  id: "animated-shapes",
  name: "Animated Shapes",
  description: "Bouncing and rotating SVG shapes with spring animations",
  category: "Other",
  durationInFrames: 180,
  fps: 30,
  code: animatedShapesCode,
};
