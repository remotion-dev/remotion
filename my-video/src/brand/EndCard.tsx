import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {poppins} from "../showcase/font";
import {BadgeRow} from "./BadgeRow";
import {brand} from "./theme";

// Closing card: a bilingual call to action, contact details and the badge row.
// The whole card fades and scales in together over its first 20 frames.
export const EndCard: React.FC<{titleVi: string; titleEn: string; website: string; phone: string}> = ({titleVi, titleEn, website, phone}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, durationInFrames: 20, config: {damping: 200}});

  return (
    <AbsoluteFill style={{background: brand.background, justifyContent: "center", alignItems: "center", fontFamily: poppins}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 28, opacity: enter, scale: String(0.95 + enter * 0.05)}}>
        <div style={{color: brand.text, fontSize: 76, fontWeight: 700, lineHeight: 1.35}}>{titleVi.normalize("NFC")}</div>
        <div style={{color: brand.textDim, fontSize: 40, lineHeight: 1.35, marginTop: -20}}>{titleEn}</div>
        <div style={{color: brand.accent, fontSize: 38, fontWeight: 600}}>
          {website} · {phone}
        </div>
        <div style={{marginTop: 24}}>
          <BadgeRow height={96} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
