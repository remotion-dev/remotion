import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import {
  ShowcaseReel,
  calculateShowcaseReelMetadata,
  showcaseReelDefaultProps,
} from "./showcase/ShowcaseReel";

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
    </>
  );
};
