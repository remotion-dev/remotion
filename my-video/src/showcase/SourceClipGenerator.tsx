import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";

// Not part of the showcase reel itself — rendered once to produce
// public/sample-clip.mp4, a locally-generated "real footage" source for
// <OffthreadVideo>/cropping/@remotion/media demos, since this sandbox has
// no network access to fetch stock footage. See scripts/generate-sample-media.mjs.
const COLORS = ["#6366f1", "#22d3ee", "#f472b6", "#34d399"];

export const SourceClipGenerator: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, width} = useVideoConfig();
  const progress = frame / durationInFrames;
  const angle = progress * 360;
  const pulse = 0.85 + 0.15 * Math.sin(frame / 6);

  return (
    <AbsoluteFill style={{backgroundColor: "#0b1120"}}>
      <AbsoluteFill
        style={{
          background: `conic-gradient(from ${angle}deg at 50% 50%, ${COLORS.join(", ")}, ${COLORS[0]})`,
          transform: `scale(${pulse})`,
        }}
      />
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <div
          style={{
            width: width * 0.28,
            height: width * 0.28,
            borderRadius: "50%",
            background: "#0b1120",
            opacity: interpolate(frame, [0, 10], [0, 0.92], {extrapolateRight: "clamp"}),
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
