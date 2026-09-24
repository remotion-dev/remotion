import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {brand} from "./theme";

// A name with a bilingual role under it, sliding in from the left over its
// first 15 frames. Put it in a <Sequence> for its timing. Pass "" for either
// role to show only the other.
export const LowerThird: React.FC<{name: string; roleVi: string; roleEn: string}> = ({name, roleVi, roleEn}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, durationInFrames: 15, config: {damping: 200}});

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        bottom: 300,
        display: "flex",
        gap: 20,
        padding: "18px 32px 18px 20px",
        borderRadius: 16,
        background: brand.panel,
        fontFamily: brand.font,
        opacity: enter,
        translate: `${interpolate(enter, [0, 1], [-60, 0])}px 0`,
      }}
    >
      <div style={{width: 8, borderRadius: 4, background: brand.accent}} />
      <div>
        <div style={{color: brand.text, fontSize: 44, fontWeight: 700, lineHeight: 1.35}}>{name.normalize("NFC")}</div>
        <div style={{color: brand.textDim, fontSize: 30, lineHeight: 1.35}}>
          {[roleVi.normalize("NFC"), roleEn].filter((role) => role !== "").join(" · ")}
        </div>
      </div>
    </div>
  );
};
