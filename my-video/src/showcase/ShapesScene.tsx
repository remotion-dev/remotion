import {makeTransform, rotate, skewX, translateY} from "@remotion/animation-utils";
import {useTransitionProgress} from "@remotion/transitions";
import {CameraMotionBlur, Trail} from "@remotion/motion-blur";
import {noise2D, noise3D, noise4D} from "@remotion/noise";
import {
  Arrow,
  Callout,
  Circle,
  Ellipse,
  Heart,
  Pie,
  Polygon,
  Rect,
  Spark,
  Star,
  Triangle,
  makeArrow,
  makeCallout,
  makeCircle,
  makeEllipse,
  makeHeart,
  makePie,
  makePolygon,
  makeRect,
  makeSpark,
  makeStar,
  makeTriangle,
} from "@remotion/shapes";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {gradientBg, palette} from "./palette";
import {poppins} from "./font";

const SHAPES = [
  {name: "Circle", delay: 0, color: palette.accent},
  {name: "Star", delay: 4, color: palette.accent2},
  {name: "Triangle", delay: 8, color: "#f472b6"},
  {name: "Rect", delay: 12, color: "#34d399"},
  {name: "Arrow", delay: 16, color: palette.accent},
  {name: "Heart", delay: 20, color: "#f87171"},
  {name: "Pie", delay: 24, color: palette.accent2},
  {name: "Polygon", delay: 28, color: "#a78bfa"},
  {name: "Ellipse", delay: 32, color: "#34d399"},
  {name: "Spark", delay: 36, color: "#facc15"},
  {name: "Callout", delay: 40, color: "#f472b6"},
] as const;

// Every make*() function returns the same raw ShapeInfo shape
// (path/width/height/transformOrigin/instructions) instead of rendering an
// SVG element -- the "generate coordinates yourself" half of
// @remotion/shapes' API, distinct from the pre-built components above.
// Useful when you need the path for @remotion/paths functions or a custom
// <svg> composition rather than a standalone shape. Rendered as its own
// compact strip below the main grid, all 11 make*() siblings alongside
// makeStar().
const RAW_SHAPES = [
  {name: "circle", color: palette.accent, ...makeCircle({radius: 22})},
  {name: "ellipse", color: "#34d399", ...makeEllipse({rx: 28, ry: 18})},
  {name: "rect", color: "#34d399", ...makeRect({width: 44, height: 44, cornerRadius: 8})},
  {name: "triangle", color: "#f472b6", ...makeTriangle({length: 48, direction: "up"})},
  {name: "arrow", color: palette.accent, ...makeArrow({length: 48, headWidth: 30, headLength: 20, shaftWidth: 12})},
  {name: "heart", color: "#f87171", ...makeHeart({height: 40})},
  // closePath: false skips the line back to the centre, so this one is an open arc.
  {name: "pie", color: palette.accent2, ...makePie({radius: 22, progress: 0.65, closePath: false})},
  {name: "polygon", color: "#a78bfa", ...makePolygon({points: 5, radius: 22})},
  {name: "spark", color: "#facc15", ...makeSpark({width: 34, height: 46})},
  {name: "callout", color: "#f472b6", ...makeCallout({width: 64, height: 30})},
  {name: "star", color: palette.text, ...makeStar({innerRadius: 14, outerRadius: 30, points: 6})},
] as const;

// Demonstrates: @remotion/shapes' full set of pre-built shape components
// (main grid) AND every one of its raw-path-data make*() siblings (the
// strip below it, all 11 sharing the same {path, width, height} ShapeInfo
// shape), @remotion/motion-blur's <Trail> (on the moving star) and
// <CameraMotionBlur> (wrapping the whole grid, a camera-level blur distinct
// from Trail's per-object echo), and all three @remotion/noise functions:
// noise2D() shifts the background gradient, noise3D() rotates its hue,
// noise4D() varies a film-grain overlay's opacity.
export const ShapesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  const shift = noise2D("shapes-bg", frame / 60, 0) * 40;
  const hueShift = noise3D("shapes-hue", frame / 90, 0, 1) * 30;
  const grainOpacity = 0.06 + noise4D("shapes-grain", frame / 20, 0, 1, 2) * 0.03;
  const bob = Math.sin(frame / 10) * 18;
  // entering is this scene's progress through the transition that brings it
  // in (TitleScene reads exiting for the other side); outside a
  // TransitionSeries it stays at 1.
  const {entering, isInTransitionSeries} = useTransitionProgress();

  return (
    <AbsoluteFill style={{background: gradientBg, fontFamily: poppins}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${50 + shift}% 50%, rgba(99,102,241,0.16) 0%, transparent 55%)`,
          filter: `hue-rotate(${hueShift}deg)`,
        }}
      />
      <div style={{position: "absolute", inset: 0, background: palette.text, opacity: grainOpacity, mixBlendMode: "overlay"}} />
      <div
        style={{
          position: "absolute",
          top: 64,
          width,
          textAlign: "center",
          color: palette.textDim,
          fontSize: 28,
          opacity: entering,
          transform: `translateY(${(1 - entering) * 30}px)`,
        }}
      >
        @remotion/shapes · @remotion/motion-blur · @remotion/noise
      </div>
      <div style={{position: "absolute", top: 104, width, textAlign: "center", color: palette.textDim, fontSize: 14, fontFamily: "monospace"}}>
        useTransitionProgress(): entering {entering.toFixed(2)}, isInTransitionSeries {String(isInTransitionSeries)}
      </div>
      <CameraMotionBlur shutterAngle={140} samples={4}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          gap: 36,
          padding: "0 60px",
        }}
      >
        {SHAPES.map((shape) => {
          const scale = spring({fps, frame: frame - shape.delay, config: {damping: 12, mass: 0.6}});

          const node = (() => {
            switch (shape.name) {
              case "Circle":
                return <Circle radius={44} fill={shape.color} />;
              case "Star":
                return (
                  <Star
                    points={5}
                    innerRadius={20} outerRadius={44}
                    fill={shape.color}
                    style={{transform: translateY(bob)}}
                  />
                );
              case "Triangle":
                return <Triangle length={90} direction="up" fill={shape.color} />;
              case "Rect":
                // makeTransform() composes animation-utils helpers into one transform string.
                return <Rect width={80} height={80} fill={shape.color} cornerRadius={12} style={{transform: makeTransform([rotate(frame * 3), skewX(10)])}} />;
              case "Arrow":
                return <Arrow length={90} headWidth={56} headLength={36} shaftWidth={22} fill={shape.color} direction="right" />;
              case "Heart":
                return <Heart height={80} aspectRatio={1.3} bottomRoundnessAdjustment={0.4} depthAdjustment={-0.3} fill={shape.color} />;
              case "Pie":
                return <Pie radius={44} progress={0.7} counterClockwise rotation={frame / 12} fill={shape.color} />;
              case "Polygon":
                // debug draws the path's control points over the shape.
                return <Polygon points={6} radius={44} fill={shape.color} debug />;
              case "Ellipse":
                return <Ellipse rx={56} ry={34} fill={shape.color} />;
              case "Spark":
                return <Spark width={70} height={98} edgeRoundness={1} cornerRadius={0} fill={shape.color} />;
              case "Callout":
                return (
                  <Callout width={140} height={64} pointerLength={16} pointerBaseWidth={24} pointerDirection="down" cornerRadius={10} fill={shape.color} />
                );
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
      </CameraMotionBlur>
      <div
        style={{
          position: "absolute",
          bottom: 130,
          width,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 20,
          opacity: interpolate(frame, [44, 60], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
        }}
      >
        {RAW_SHAPES.map((shape) => (
          <svg key={shape.name} width={shape.width} height={shape.height} style={{overflow: "visible"}}>
            <path d={shape.path} fill={shape.color} />
          </svg>
        ))}
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
