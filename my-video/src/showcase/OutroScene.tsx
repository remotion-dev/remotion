import {interpolateStyles} from "@remotion/animation-utils";
import {Box, Bracket, Circle, CrossedOff, StrikeThrough, Underline} from "@remotion/rough-notation";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {gradientBg, palette} from "./palette";
import {poppins} from "./font";

// Demonstrates: @remotion/animation-utils' interpolateStyles() for combining
// multiple animated CSS properties in one call, plus rough-notation's six
// annotation styles as a closing flourish: <Underline>, <Box>, <Circle>,
// <Bracket>, <StrikeThrough> and <CrossedOff> (<Highlight> is used in
// TitleScene).
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  const intro = interpolateStyles(
    frame,
    [0, 20],
    [
      {opacity: 0, transform: "translateY(24px) scale(0.96)"},
      {opacity: 1, transform: "translateY(0px) scale(1)"},
    ],
  );

  const wordmarkScale = spring({fps, frame: frame - 30, config: {damping: 200}});

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
        <Box color={palette.accent} progress={interpolate(frame, [18, 34], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}>
          Claude Chat
        </Box>
        ,{" "}
        <Circle color={palette.accent2} progress={interpolate(frame, [24, 40], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}>
          Claude Cowork
        </Circle>
        , or{" "}
        <Bracket
          color={palette.accent}
          bracketLeft
          bracketRight
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
        <StrikeThrough color={palette.textDim} progress={interpolate(frame, [48, 60], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}>
          manual editing
        </StrikeThrough>
        , no{" "}
        <CrossedOff color={palette.textDim} progress={interpolate(frame, [54, 66], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}>
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
          transform: `scale(${wordmarkScale})`,
          opacity: interpolate(frame, [30, 40], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
        }}
      >
        MY-VIDEO
      </div>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.textDim, fontSize: 24}}>
        @remotion/animation-utils · @remotion/rough-notation (6 annotation styles)
      </div>
    </AbsoluteFill>
  );
};
