import "./index.css";
import { Composition, Folder, Still } from "remotion";
import { MyComposition } from "./Composition";
import {
  ShowcaseReel,
  calculateShowcaseReelMetadata,
  showcaseReelDefaultProps,
} from "./showcase/ShowcaseReel";
import {
  ExtendedReel,
  calculateExtendedReelMetadata,
  extendedReelDefaultProps,
  extendedReelSchema,
} from "./showcase/ExtendedReel";
import { SourceClipGenerator } from "./showcase/SourceClipGenerator";
import {
  FullReel,
  calculateFullReelMetadata,
  fullReelDefaultProps,
  fullReelSchema,
} from "./showcase/FullReel";
import { AbsoluteFill } from "remotion";
import { gradientBg, palette } from "./showcase/palette";
import { poppins } from "./showcase/font";

// A single-frame <Still> for a poster image (`npx remotion still Poster`).
// Deliberately static rather than reusing TitleScene's animated entrance —
// a <Still> always renders frame 0, where a spring()/interpolate() entrance
// hasn't started yet, so it would render blank.
const PosterStill: React.FC = () => (
  <AbsoluteFill style={{background: gradientBg, justifyContent: "center", alignItems: "center", fontFamily: poppins}}>
    <div style={{fontSize: 110, fontWeight: 700, color: palette.text, letterSpacing: -2}}>
      {fullReelDefaultProps.title}
    </div>
    <div style={{fontSize: 36, color: palette.textDim, marginTop: 24}}>{fullReelDefaultProps.subtitle}</div>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Folder name="Reels">
        <Composition
          id="ShowcaseReel"
          component={ShowcaseReel}
          width={1280}
          height={720}
          fps={30}
          durationInFrames={300}
          defaultProps={showcaseReelDefaultProps}
          calculateMetadata={calculateShowcaseReelMetadata}
        />
        <Composition
          id="ExtendedReel"
          component={ExtendedReel}
          width={1280}
          height={720}
          fps={30}
          durationInFrames={1155}
          schema={extendedReelSchema}
          defaultProps={extendedReelDefaultProps}
          calculateMetadata={calculateExtendedReelMetadata}
        />
        <Composition
          id="FullReel"
          component={FullReel}
          width={1280}
          height={720}
          fps={30}
          durationInFrames={1335}
          schema={fullReelSchema}
          defaultProps={fullReelDefaultProps}
          calculateMetadata={calculateFullReelMetadata}
        />
      </Folder>
      <Folder name="Utilities">
        {/* Not part of any reel — a one-off source generator for
            public/sample-clip.mp4 (see scripts/generate-sample-media.mjs). */}
        <Composition
          id="SourceClipGenerator"
          component={SourceClipGenerator}
          width={960}
          height={540}
          fps={30}
          durationInFrames={90}
        />
        <Still id="Poster" component={PosterStill} width={1280} height={720} />
      </Folder>
    </>
  );
};
