import type { SceneAndMetadata } from "../../config/scenes";

export const getSceneEnter = ({
  canvasWidth,
  previousScene,
  currentScene,
}: {
  canvasWidth: number;
  previousScene: SceneAndMetadata | null;
  currentScene: SceneAndMetadata;
}): {
  left: number;
} => {
  if (previousScene === null) {
    return {
      left: 0,
    };
  }

  if (
    previousScene.type === "video-scene" &&
    currentScene.type === "video-scene"
  ) {
    return {
      left: 0,
    };
  }

  return {
    left: canvasWidth,
  };
};

export const getSceneExit = ({
  canvasWidth,
  nextScene,
  currentScene,
}: {
  canvasWidth: number;
  nextScene: SceneAndMetadata | null;
  currentScene: SceneAndMetadata;
}) => {
  if (nextScene === null) {
    return {
      left: 0,
    };
  }

  if (nextScene.type === "video-scene" && currentScene.type === "video-scene") {
    return {
      left: 0,
    };
  }

  return {
    left: -canvasWidth,
  };
};
