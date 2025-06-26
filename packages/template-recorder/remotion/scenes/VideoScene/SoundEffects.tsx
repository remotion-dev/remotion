import { Audio, staticFile } from "remotion";
import type { SceneAndMetadata } from "../../../config/scenes";
import {
  isGrowingFromMiniature,
  isShrinkingToMiniature,
} from "../../animations/webcam-transitions/helpers";

export const SoundEffects: React.FC<{
  previousScene: SceneAndMetadata | null;
  sceneAndMetadata: SceneAndMetadata;
}> = ({ previousScene, sceneAndMetadata }) => {
  if (!previousScene) {
    return null;
  }

  if (
    isShrinkingToMiniature({
      firstScene: previousScene,
      secondScene: sceneAndMetadata,
    })
  ) {
    return <Audio src={staticFile("sounds/shrink.m4a")} volume={0.2} />;
  }

  if (
    isGrowingFromMiniature({
      firstScene: previousScene,
      secondScene: sceneAndMetadata,
    })
  ) {
    return <Audio src={staticFile("sounds/grow.m4a")} volume={0.2} />;
  }

  return <Audio src={staticFile("sounds/whip.wav")} volume={0.1} />;
};
