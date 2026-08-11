import React from "react";
import {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../config/scenes";
import { Theme } from "../../../config/themes";
import { WaitForFonts } from "../../helpers/WaitForFonts";
import { CaptionOverlay } from "../editor/CaptionOverlay";
import { AnimatedCaptions } from "./components/AnimatedCaptions";
import { NoCaptionsPlaceholder } from "./components/NoCaptionsPlaceholder";

export const BoxedCaptions: React.FC<{
  sceneAndMetadata: VideoSceneAndMetadata;
  theme: Theme;
  startFrame: number;
  enterProgress: number;
  exitProgress: number;
  nextScene: SceneAndMetadata | null;
  previousScene: SceneAndMetadata | null;
}> = ({
  sceneAndMetadata,
  theme,
  enterProgress,
  exitProgress,
  nextScene,
  previousScene,
  startFrame,
}) => {
  if (!sceneAndMetadata.layout.subtitleLayout) {
    return null;
  }

  if (sceneAndMetadata.cameras.captions) {
    return (
      <WaitForFonts>
        <CaptionOverlay
          file={sceneAndMetadata.cameras.captions}
          theme={theme}
          trimStart={startFrame}
        >
          <AnimatedCaptions
            trimStart={startFrame}
            enterProgress={enterProgress}
            exitProgress={exitProgress}
            scene={sceneAndMetadata}
            nextScene={nextScene}
            previousScene={previousScene}
            theme={theme}
            subtitleLayout={sceneAndMetadata.layout.subtitleLayout}
          />
        </CaptionOverlay>
      </WaitForFonts>
    );
  }

  return (
    <NoCaptionsPlaceholder
      layout={sceneAndMetadata.layout.subtitleLayout}
      theme={theme}
    />
  );
};
