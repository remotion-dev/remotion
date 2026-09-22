import {grayscale} from "@remotion/effects/grayscale";
import {scanlines} from "@remotion/effects/scanlines";
import {vignette} from "@remotion/effects/vignette";
import {AbsoluteFill, Solid, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Demonstrates: @remotion/effects — chaining several WebGL2 passes (grayscale,
// vignette, scanlines) on a single canvas-based component, each animated from
// useCurrentFrame(). Effects apply to <Video> (@remotion/media), <Solid>,
// <CanvasImage> and <HtmlInCanvas>; this scene uses <Solid> since it needs
// no source asset. Requires --gl (or Config.setChromiumOpenGlRenderer) at
// render time — see AGENTS.md for this environment's setup note.
export type EffectsSceneProps = {
  accentColor?: string;
};

export const EffectsScene: React.FC<EffectsSceneProps> = ({accentColor = palette.accent}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();

  const desaturate = interpolate(frame, [0, 30], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vignetteAmount = interpolate(frame, [10, 45], [0, 0.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 28, zIndex: 1}}>
        @remotion/effects · grayscale + vignette + scanlines (WebGL2, chained)
      </div>
      <Solid
        color={accentColor}
        width={1280}
        height={720}
        effects={[
          grayscale({amount: desaturate}),
          vignette({amount: vignetteAmount, color: "#0b1120"}),
          scanlines({amount: 0.25, spacing: 3, offset: frame * 2}),
        ]}
      />
    </AbsoluteFill>
  );
};
