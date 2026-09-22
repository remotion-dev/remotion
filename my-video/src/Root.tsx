import "./index.css";
import { Composition } from "remotion";
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

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
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
        durationInFrames={555}
        schema={extendedReelSchema}
        defaultProps={extendedReelDefaultProps}
        calculateMetadata={calculateExtendedReelMetadata}
      />
      {/* Not part of either reel — a one-off source generator for
          public/sample-clip.mp4 (see scripts/generate-sample-media.mjs). */}
      <Composition
        id="SourceClipGenerator"
        component={SourceClipGenerator}
        width={960}
        height={540}
        fps={30}
        durationInFrames={90}
      />
    </>
  );
};
