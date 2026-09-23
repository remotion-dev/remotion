import {blur} from "@remotion/effects/blur";
import {chromaticAberration} from "@remotion/effects/chromatic-aberration";
import {duotone} from "@remotion/effects/duotone";
import {grayscale} from "@remotion/effects/grayscale";
import {scanlines} from "@remotion/effects/scanlines";
import {vignette} from "@remotion/effects/vignette";
import {AbsoluteFill, Solid, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Demonstrates: @remotion/effects — chaining six WebGL2 passes (blur,
// duotone, grayscale, chromaticAberration, vignette, scanlines) on a single
// canvas-based component, each animated from useCurrentFrame(). See
// effects.md for the full list of ~75 available effects; this scene and the
// skill's own inline example (blur()) now overlap deliberately. Effects
// apply to <Video> (@remotion/media), <Solid>, <CanvasImage> and
// <HtmlInCanvas>; this scene uses <Solid> since it needs no source asset.
// Requires --gl (or Config.setChromiumOpenGlRenderer) at render time — see
// AGENTS.md for this environment's setup note.
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
  const blurRadius = interpolate(frame, [0, 20], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const aberration = interpolate(frame, [45, 75], [0, 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26, zIndex: 1}}>
        @remotion/effects · blur + duotone + grayscale + chromaticAberration + vignette + scanlines
      </div>
      <Solid
        color={accentColor}
        width={1280}
        height={720}
        effects={[
          blur({radius: blurRadius}),
          duotone({darkColor: "#0b1120", lightColor: accentColor, threshold: 0.4}),
          grayscale({amount: desaturate}),
          chromaticAberration({amount: aberration, angle: 0}),
          vignette({amount: vignetteAmount, color: "#0b1120"}),
          scanlines({amount: 0.25, spacing: 3, offset: frame * 2}),
        ]}
      />
    </AbsoluteFill>
  );
};
