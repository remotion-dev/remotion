import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../config/scenes";
import type { LayoutAndFade } from "../../layout/layout-types";

export const getLandscapeDisplayEnterOrExit = ({
  currentScene,
  otherScene,
}: {
  otherScene: SceneAndMetadata | null;
  currentScene: VideoSceneAndMetadata;
}): LayoutAndFade => {
  if (
    currentScene.type !== "video-scene" ||
    currentScene.layout.displayLayout === null
  ) {
    throw new Error("no transitions on non-video scenes");
  }

  if (otherScene === null || otherScene.type !== "video-scene") {
    return {
      layout: currentScene.layout.displayLayout,
      shouldFadeRecording: false,
    };
  }

  if (otherScene.layout.displayLayout === null) {
    // landscape, Slide in from left
    return {
      layout: currentScene.layout.displayLayout,
      shouldFadeRecording: false,
    };
  }

  return {
    layout: otherScene.layout.displayLayout,
    shouldFadeRecording: true,
  };
};
