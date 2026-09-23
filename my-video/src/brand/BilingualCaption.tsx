import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {poppins} from "../showcase/font";
import {brand} from "./theme";

// Vietnamese on the main line, English smaller underneath, sharing one timing
// (see "Language" in AGENTS.md). Put it in a <Sequence> for its timing; it
// fades and rises in over its first 10 frames. Line height 1.35 and no
// clipping leave room for stacked Vietnamese marks.
export const BilingualCaption: React.FC<{vi: string; en: string}> = ({vi, en}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, durationInFrames: 10, config: {damping: 200}});

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 80,
        display: "flex",
        justifyContent: "center",
        opacity: enter,
        translate: `0 ${interpolate(enter, [0, 1], [20, 0])}px`,
      }}
    >
      <div style={{maxWidth: "80%", padding: "16px 36px", borderRadius: 18, background: brand.panel, textAlign: "center", fontFamily: poppins}}>
        <div style={{color: brand.text, fontSize: 48, fontWeight: 700, lineHeight: 1.35}}>{vi.normalize("NFC")}</div>
        <div style={{color: brand.textDim, fontSize: 30, lineHeight: 1.35, marginTop: 4}}>{en}</div>
      </div>
    </div>
  );
};
