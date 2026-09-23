import {interpolateStyles} from "@remotion/animation-utils";
import {Box, Bracket, Circle, CrossedOff, StrikeThrough, Underline} from "@remotion/rough-notation";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {gradientBg, palette} from "./palette";
import {poppins} from "./font";

type OutroSceneProps = {
  // A @remotion/zod-types' zMatrix() value from FullReel's schema -- a flat
  // square array (2x2 here) rather than a full CSS matrix3d()'s 16 values.
  // null in reels that don't expose this parameter.
  logoMatrix: number[] | null;
};

// Demonstrates: @remotion/animation-utils' interpolateStyles() for combining
// multiple animated CSS properties in one call, rough-notation's six
// annotation styles as a closing flourish (<Underline>, <Box>, <Circle>,
// <Bracket>, <StrikeThrough> and <CrossedOff> -- <Highlight> is used in
// TitleScene), and @remotion/zod-types' zMatrix() (FullReel's schema),
// applied as a real CSS matrix() transform on the wordmark.
export const OutroScene: React.FC<OutroSceneProps> = ({logoMatrix}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const [matrixA, matrixB, matrixC, matrixD] = logoMatrix ?? [1, 0, 0, 1];

  const intro = interpolateStyles(
    frame,
    [0, 20],
    [
      {opacity: 0, transform: "translateY(24px) scale(0.96)"},
      {opacity: 1, transform: "translateY(0px) scale(1)"},
    ],
  );

  // delay replaces a hand-shifted frame; durationInFrames stretches the
  // spring to settle in exactly 24 frames.
  const wordmarkScale = spring({fps, frame, delay: 30, durationInFrames: 24, config: {damping: 200}});

  return (
    <AbsoluteFill
      style={{
        background: gradientBg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: poppins,
      }}
    >
      <div style={{...intro, fontSize: 64, fontWeight: 700, color: palette.text, textAlign: "center"}}>
        <Underline
          color={palette.accent2}
          rtl
          bowing={3}
          strokeWidth={8}
          iterations={1}
          padding={{top: 4}}
          name="Outro underline"
          progress={interpolate(frame, [12, 32], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}
        >
          Ready
        </Underline>{" "}
        to build your video?
      </div>
      <div
        style={{
          ...interpolateStyles(
            frame,
            [10, 28],
            [{opacity: 0, transform: "translateY(12px)"}, {opacity: 1, transform: "translateY(0px)"}],
          ),
          fontSize: 28,
          color: palette.textDim,
          marginTop: 20,
        }}
      >
        Ask in{" "}
        {/* A new seed every 4 frames redraws the rough shape, the "boiling"
            hand-drawn look the seed docs describe; preserveVertices keeps
            the corners where they are while the edges wobble. */}
        <Box
          color={palette.accent}
          strokeWidth={3}
          iterations={1}
          padding={{left: 8, right: 8}}
          seed={Math.floor(frame / 4)}
          preserveVertices
          name="Outro box"
          progress={interpolate(frame, [18, 34], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}
        >
          Claude Chat
        </Box>
        ,{" "}
        {/* strokeWidth defaults to 20 (7 for <Box>), which buries the words, so
            every annotation here sets its own. box="inside" fits the ellipse
            inside the padded box instead of circumscribing the text, so the
            padding is what keeps it clear of the words. style applies to the
            circled text itself. */}
        <Circle
          color={palette.accent2}
          strokeWidth={6}
          iterations={1}
          roughness={2.5}
          curveTightness={0.4}
          curveFitting={0.9}
          curveStepCount={12}
          box="inside"
          padding={{left: 34, right: 34, top: 16, bottom: 16}}
          style={{color: palette.text}}
          name="Outro circle"
          progress={interpolate(frame, [24, 40], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}
        >
          Claude Cowork
        </Circle>
        , or{" "}
        <Bracket
          color={palette.accent}
          strokeWidth={4}
          padding={{left: 6, right: 6, top: 2, bottom: 2}}
          bracketLeft
          bracketRight
          bracketTop
          bracketBottom
          name="Outro bracket"
          progress={interpolate(frame, [30, 46], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}
        >
          Claude Code
        </Bracket>
        .
      </div>
      <div
        style={{
          opacity: interpolate(frame, [45, 60], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
          fontSize: 22,
          color: palette.textDim,
          marginTop: 16,
        }}
      >
        No{" "}
        <StrikeThrough
          color={palette.textDim}
          seed={7}
          disableMultiStroke
          strokeWidth={3}
          iterations={2}
          rtl
          name="Outro strike-through"
          progress={interpolate(frame, [48, 60], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}
        >
          manual editing
        </StrikeThrough>
        , no{" "}
        <CrossedOff
          color={palette.textDim}
          maxRandomnessOffset={4}
          iterations={2}
          strokeWidth={3}
          rtl
          name="Outro crossed-off"
          progress={interpolate(frame, [54, 66], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}
        >
          timelines
        </CrossedOff>
        .
      </div>
      <div
        style={{
          marginTop: 56,
          fontSize: 32,
          letterSpacing: 4,
          color: palette.accent2,
          transform: `scale(${wordmarkScale}) matrix(${matrixA}, ${matrixB}, ${matrixC}, ${matrixD}, 0, 0)`,
          opacity: interpolate(frame, [30, 40], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
        }}
      >
        MY-VIDEO
      </div>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.textDim, fontSize: 24}}>
        @remotion/animation-utils · @remotion/rough-notation (6 styles) · @remotion/zod-types zMatrix()
      </div>
    </AbsoluteFill>
  );
};
