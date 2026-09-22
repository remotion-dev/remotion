import {interpolateStyles} from "@remotion/animation-utils";
import {Underline} from "@remotion/rough-notation";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {gradientBg, palette} from "./palette";
import {poppins} from "./font";

// Demonstrates: @remotion/animation-utils' interpolateStyles() for combining
// multiple animated CSS properties in one call, plus a rough-notation
// <Underline> as a closing flourish.
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
        Ask in Claude Chat, Claude Cowork, or Claude Code.
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
        @remotion/animation-utils · @remotion/rough-notation
      </div>
    </AbsoluteFill>
  );
};
