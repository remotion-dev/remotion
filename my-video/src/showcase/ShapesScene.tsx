import {translateY} from "@remotion/animation-utils";
import {Trail} from "@remotion/motion-blur";
import {noise2D} from "@remotion/noise";
import {Circle, Rect, Star, Triangle} from "@remotion/shapes";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {gradientBg, palette} from "./palette";
import {poppins} from "./font";

const SHAPES = [
  {name: "Circle", delay: 0, color: palette.accent},
  {name: "Star", delay: 6, color: palette.accent2},
  {name: "Triangle", delay: 12, color: "#f472b6"},
  {name: "Rect", delay: 18, color: "#34d399"},
] as const;

// Demonstrates: @remotion/shapes primitives, a @remotion/motion-blur <Trail>
// on the moving star, and a @remotion/noise-driven background shimmer.
export const ShapesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  const shift = noise2D("shapes-bg", frame / 60, 0) * 40;
  const bob = Math.sin(frame / 10) * 18;

  return (
    <AbsoluteFill style={{background: gradientBg, fontFamily: poppins}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${50 + shift}% 50%, rgba(99,102,241,0.16) 0%, transparent 55%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 64,
          width,
          textAlign: "center",
          color: palette.textDim,
          fontSize: 28,
        }}
      >
        @remotion/shapes · @remotion/motion-blur · @remotion/noise
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 90,
        }}
      >
        {SHAPES.map((shape) => {
          const scale = spring({fps, frame: frame - shape.delay, config: {damping: 12, mass: 0.6}});

          const node = (() => {
            switch (shape.name) {
              case "Circle":
                return <Circle radius={60} fill={shape.color} />;
              case "Star":
                return (
                  <Star
                    points={5}
                    innerRadius={28}
                    outerRadius={62}
                    fill={shape.color}
                    style={{transform: translateY(bob)}}
                  />
                );
              case "Triangle":
                return <Triangle length={130} direction="up" fill={shape.color} />;
              case "Rect":
                return <Rect width={110} height={110} fill={shape.color} cornerRadius={16} />;
            }
          })();

          const wrapped =
            shape.name === "Star" ? (
              <Trail layers={8} lagInFrames={2} trailOpacity={0.16}>
                {node}
              </Trail>
            ) : (
              node
            );

          return (
            <div key={shape.name} style={{transform: `scale(${scale})`}}>
              {wrapped}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 56,
          width,
          textAlign: "center",
          color: palette.text,
          fontSize: 34,
          fontWeight: 600,
          opacity: interpolate(frame, [40, 55], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
        }}
      >
        Spring-driven shapes, motion blur trails, procedural noise
      </div>
    </AbsoluteFill>
  );
};
