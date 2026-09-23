import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {palette} from "./palette";

// Rendered inside a <TransitionSeries.Overlay>, which centers it on the cut
// between two scenes and gives it its own frame count, so peaking at the
// midpoint lands the flash exactly on the cut.
export const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const opacity = interpolate(frame, [0, durationInFrames / 2, durationInFrames], [0, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{background: palette.accent2, opacity, pointerEvents: "none"}} />;
};
