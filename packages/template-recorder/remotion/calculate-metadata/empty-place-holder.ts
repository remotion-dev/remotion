import { SceneAndMetadata } from "../../config/scenes";

export const PLACEHOLDER_DURATION_IN_FRAMES = 60;

export const addPlaceholderIfNoScenes = ({
  totalDurationInFrames,
  scenesAndMetadataWithDuration,
}: {
  totalDurationInFrames: number;
  scenesAndMetadataWithDuration: SceneAndMetadata[];
}): {
  totalDurationInFrames: number;
  scenesAndMetadataWithDuration: SceneAndMetadata[];
} => {
  if (scenesAndMetadataWithDuration.length > 0) {
    return {
      scenesAndMetadataWithDuration,
      totalDurationInFrames,
    };
  }

  return {
    scenesAndMetadataWithDuration: [
      {
        type: "other-scene" as const,
        scene: {
          type: "noscenes" as const,
          music: "none",
          transitionToNextScene: true,
        },
        durationInFrames: PLACEHOLDER_DURATION_IN_FRAMES,
        from: 0,
      },
    ],
    totalDurationInFrames: PLACEHOLDER_DURATION_IN_FRAMES,
  };
};
