import {blur} from "@remotion/effects/blur";
import {chromaticAberration} from "@remotion/effects/chromatic-aberration";
import {duotone} from "@remotion/effects/duotone";
import {grayscale} from "@remotion/effects/grayscale";
import {lightLeak} from "@remotion/effects/light-leak";
import {scanlines} from "@remotion/effects/scanlines";
import {starburst} from "@remotion/effects/starburst";
import {vignette} from "@remotion/effects/vignette";
import {AbsoluteFill, Solid, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Demonstrates: @remotion/effects — chaining six WebGL2 passes (blur,
// duotone, grayscale, chromaticAberration, vignette, scanlines) on a single
// canvas-based component, each animated from useCurrentFrame(). The catalog
// has 74 effects (EffectsCatalogScene shows each one); this scene and the
// effects.md skill's own inline example (blur()) overlap deliberately.
// Effects apply to core <Img>, <AnimatedImage>, <CanvasImage>, <Solid> and
// <HtmlInCanvas>, and to @remotion/media's <Video>, @remotion/gif's <Gif>,
// @remotion/shapes' shapes and @remotion/rive's <RemotionRiveCanvas>; this
// scene uses <Solid> since it needs no source asset.
// Requires --gl (or Config.setChromiumOpenGlRenderer) at render time — see
// AGENTS.md for this environment's setup note.
//
// The inset shows two more effects: starburst() generates rays (it ignores
// its input, so it goes first in its chain) and lightLeak() blends a leak
// over whatever came before it. These replace the deprecated standalone
// @remotion/starburst and @remotion/light-leaks packages.
const INSET_WIDTH = 560;
const INSET_HEIGHT = 315;

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
  // lightLeak's progress runs 0 → 1: the leak grows in, covers everything
  // around 0.5, then retracts. This stays in the growing phase so the
  // starburst underneath is still visible.
  const leakProgress = interpolate(frame, [0, 75], [0.05, 0.4], {
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
          // Axis toggles are real options, but on a flat <Solid> at the start of
          // the chain there is nothing to soften, so neither the blur nor its
          // axis choice is visible here.
          blur({radius: blurRadius, horizontal: true, vertical: false}),
          duotone({darkColor: "#0b1120", lightColor: accentColor, threshold: 0.4}),
          grayscale({amount: desaturate}),
          chromaticAberration({amount: aberration, angle: 0}),
          // An off-centre, softer, squarer vignette: roundness goes from 0 (the
          // frame's rectangle) to 1 (an ellipse, the default). mode: "alpha"
          // (fade to transparent instead of to a color) would look the same
          // here, since the page behind the <Solid> is the same dark color.
          vignette({amount: vignetteAmount, color: "#0b1120", center: [0.4, 0.5], radius: 0.55, feather: 0.6, roundness: 0.4}),
          scanlines({amount: 0.25, spacing: 3, offset: frame * 2}),
        ]}
      />
      <div style={{position: "absolute", left: (width - INSET_WIDTH) / 2, top: 190, display: "flex", flexDirection: "column", alignItems: "center", gap: 10}}>
        <Solid
          color="#000000"
          width={INSET_WIDTH}
          height={INSET_HEIGHT}
          style={{borderRadius: 16}}
          effects={[
            starburst({rays: 12, colors: [accentColor, "#0b1120", palette.accent2], rotation: frame * 0.8, smoothness: 0.3, origin: [0.5, 0.9]}),
            lightLeak({seed: 3, hueShift: 30, progress: leakProgress}),
          ]}
        />
        <div style={{color: palette.text, fontSize: 18, fontFamily: "monospace"}}>
          starburst() → lightLeak({"{"}progress: {leakProgress.toFixed(2)}{"}"})
        </div>
      </div>
    </AbsoluteFill>
  );
};
