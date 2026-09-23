import {Circle, LinearGradient, RoundedRect} from "@shopify/react-native-skia";
import {SkiaCanvas} from "@remotion/skia";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 400;

// Demonstrates: @remotion/skia's <SkiaCanvas> — a Remotion-aware wrapper
// around React Native Skia's <Canvas>, the same GPU-accelerated 2D graphics
// engine (Skia/CanvasKit compiled to WebAssembly) that powers Chrome and
// Flutter, distinct from plain SVG or <canvas> 2D. Shapes are driven by
// useCurrentFrame()-computed props rather than react-native-skia's own
// Reanimated hooks (useValue()/useSharedValue()), which aren't frame-
// deterministic. Needs enableSkia() in remotion.config.ts (rspack variant,
// since this project uses Config.setRspack(true)) plus LoadSkia() called
// before registerRoot() in src/index.ts — see skia.mdx/enable-skia.mdx.
export const SkiaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, width} = useVideoConfig();

  const corner = interpolate(frame, [0, durationInFrames / 2, durationInFrames], [16, 120, 16]);
  const orbitX = Math.sin(frame / 12) * 220;

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center", alignItems: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/skia · React Native Skia's Canvas, frame-driven
      </div>
      <SkiaCanvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        <RoundedRect x={50} y={50} width={CANVAS_WIDTH - 100} height={CANVAS_HEIGHT - 100} r={corner}>
          <LinearGradient
            start={{x: 50, y: 50}}
            end={{x: CANVAS_WIDTH - 50, y: CANVAS_HEIGHT - 50}}
            colors={[palette.accent, palette.accent2]}
          />
        </RoundedRect>
        <Circle cx={CANVAS_WIDTH / 2 + orbitX} cy={CANVAS_HEIGHT / 2} r={36} color={palette.text} opacity={0.85} />
      </SkiaCanvas>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.text, fontSize: 32, fontWeight: 600}}>
        GPU-accelerated 2D graphics, composed with shaders
      </div>
    </AbsoluteFill>
  );
};
