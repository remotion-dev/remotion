import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../config/scenes";
import type { LayoutAndFade } from "../../layout/layout-types";
import { isWebCamAtBottom } from "../webcam-transitions/helpers";

export const getPortraitDisplayEnterOrExit = ({
  currentScene,
  otherScene,
  canvasHeight,
}: {
  otherScene: SceneAndMetadata | null;
  currentScene: VideoSceneAndMetadata;
  canvasHeight: number;
}): LayoutAndFade => {
  const currentLayout = currentScene.layout.displayLayout;

  if (currentScene.type !== "video-scene" || currentLayout === null) {
    throw new Error("no transitions on non-video scenes");
  }

  if (!otherScene || otherScene.type !== "video-scene") {
    return { layout: currentLayout, shouldFadeRecording: false };
  }

  if (otherScene.layout.displayLayout !== null) {
    return {
      layout: otherScene.layout.displayLayout,
      shouldFadeRecording: true,
    };
  }

  return {
    layout: {
      ...currentLayout,
      top: isWebCamAtBottom(currentScene.webcamPosition)
        ? -currentLayout.height
        : canvasHeight,
    },
    shouldFadeRecording: false,
  };
};
