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
        <Box color={palette.accent} strokeWidth={3} padding={{left: 8, right: 8}} progress={interpolate(frame, [18, 34], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}>
          Claude Chat
        </Box>
        ,{" "}
        {/* box defaults to "around" (circumscribes the text); strokeWidth defaults to 20, which buried the words. */}
        <Circle color={palette.accent2} strokeWidth={6} roughness={2.5} curveTightness={0.4} progress={interpolate(frame, [24, 40], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}>
          Claude Cowork
        </Circle>
        , or{" "}
        <Bracket
          color={palette.accent}
          bracketLeft
          bracketRight
          bracketBottom
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
        <StrikeThrough color={palette.textDim} seed={7} disableMultiStroke progress={interpolate(frame, [48, 60], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}>
          manual editing
        </StrikeThrough>
        , no{" "}
        <CrossedOff color={palette.textDim} maxRandomnessOffset={4} iterations={1} progress={interpolate(frame, [54, 66], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}>
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
