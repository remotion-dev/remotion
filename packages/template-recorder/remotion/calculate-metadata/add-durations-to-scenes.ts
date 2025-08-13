import { CanvasLayout } from "../../config/layout";
import { SceneAndMetadata } from "../../config/scenes";
import { SCENE_TRANSITION_DURATION } from "../../config/transitions";
import {
  getShouldTransitionIn,
  getShouldTransitionOut,
} from "../animations/transitions";
import { applyBRollRules } from "../scenes/BRoll/apply-b-roll-rules";
import { addPlaceholderIfNoScenes } from "./empty-place-holder";

export const addDurationsToScenes = (
  scenes: SceneAndMetadata[],
  canvasLayout: CanvasLayout,
): {
  totalDurationInFrames: number;
  scenesAndMetadataWithDuration: SceneAndMetadata[];
} => {
  let totalDurationInFrames = 0;

  const scenesAndMetadataWithDuration: SceneAndMetadata[] = scenes.map(
    (sceneAndMetadata, i): SceneAndMetadata => {
      const previousSceneAndMetadata = scenes[i - 1] ?? null;
      const nextSceneAndMetadata = scenes[i + 1] ?? null;

      const isTransitioningIn = getShouldTransitionIn({
        previousSceneAndMetadata,
        sceneAndMetadata,
        canvasLayout,
      });
      const isTransitioningOut = getShouldTransitionOut({
        sceneAndMetadata,
        nextSceneAndMetadata,
        canvasLayout,
      });

      if (isTransitioningIn) {
        totalDurationInFrames -= SCENE_TRANSITION_DURATION;
      }

      const from = totalDurationInFrames;
      totalDurationInFrames += sceneAndMetadata.durationInFrames;

      if (sceneAndMetadata.type === "other-scene") {
        return {
          ...sceneAndMetadata,
          from,
        };
      }

      let sceneDurationInFrames = sceneAndMetadata.durationInFrames;

      let startFrame = sceneAndMetadata.startFrame;

      if (isTransitioningIn) {
        startFrame -= SCENE_TRANSITION_DURATION;

        if (startFrame < 0) {
          startFrame = 0;
        }

        const additionalTransitionFrames =
          sceneAndMetadata.startFrame - startFrame;

        totalDurationInFrames += additionalTransitionFrames;
        sceneDurationInFrames += additionalTransitionFrames;
      }

      const retValue: SceneAndMetadata = {
        ...sceneAndMetadata,
        bRolls: applyBRollRules({
          bRolls: sceneAndMetadata.bRolls,
          sceneDurationInFrames: sceneDurationInFrames,
          willTransitionToNextScene: isTransitioningOut,
        }),
        startFrame,
        durationInFrames: sceneDurationInFrames,
        from,
      };

      return retValue;
    },
  );

  return addPlaceholderIfNoScenes({
    totalDurationInFrames: totalDurationInFrames,
    scenesAndMetadataWithDuration,
  });
};
