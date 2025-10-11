import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../config/scenes";
import type { LayoutAndFade } from "../../layout/layout-types";
import { isWebCamAtBottom } from "./helpers";

export const getSquareWebcamStartOrEndLayout = ({
  otherScene,
  currentScene,
  canvasHeight,
}: {
  otherScene: SceneAndMetadata | null;
  currentScene: VideoSceneAndMetadata;
  canvasHeight: number;
}): LayoutAndFade => {
  if (!currentScene || currentScene.type !== "video-scene") {
    throw new Error("no transitions on non-video scenes");
  }

  const currentLayout = currentScene.layout.webcamLayout;

  // No entrance if the other scene is not a video scene
  if (!otherScene || otherScene.type !== "video-scene") {
    return {
      layout: currentScene.layout.webcamLayout,
      shouldFadeRecording: false,
    };
  }

  // When at least 1 scene is fullscreen, the webcam can just move to the new position
  if (!currentScene.layout.displayLayout || !otherScene.layout.displayLayout) {
    return {
      layout: otherScene.layout.webcamLayout,
      shouldFadeRecording: true,
    };
  }

  // Same position horizontally, webcam can just move to the new position
  if (
    isWebCamAtBottom(otherScene.webcamPosition) ===
    isWebCamAtBottom(currentScene.webcamPosition)
  ) {
    return {
      layout: otherScene.layout.webcamLayout,
      shouldFadeRecording: true,
    };
  }

  // Display is moving from bottom to top or vice versa
  // Webcam will animate out of the edge and appear from the other side
  if (isWebCamAtBottom(currentScene.webcamPosition)) {
    return {
      layout: {
        ...currentLayout,
        top: canvasHeight,
      },
      shouldFadeRecording: false,
    };
  }

  return {
    layout: {
      ...currentLayout,
      top: -currentLayout.height,
    },
    shouldFadeRecording: false,
  };
};
