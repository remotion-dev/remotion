import { getSafeSpace } from "../../../config/layout";
import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../config/scenes";
import type { LayoutAndFade } from "../../layout/layout-types";
import { isWebCamRight } from "./helpers";

export const getLandscapeWebCamStartOrEndLayout = ({
  canvasWidth,
  otherScene,
  currentScene,
}: {
  otherScene: SceneAndMetadata | null;
  currentScene: VideoSceneAndMetadata;
  canvasWidth: number;
}): LayoutAndFade => {
  const currentLayout = currentScene.layout.webcamLayout;

  if (!otherScene || otherScene.type !== "video-scene") {
    return { layout: currentLayout, shouldFadeRecording: false };
  }

  // When at least 1 scene is fullscreen, the webcam can just move to the new position.
  if (!currentScene.layout.displayLayout || !otherScene.layout.displayLayout) {
    // The next display may overlap the webcam, so we cannot use a fade
    return {
      layout: otherScene.layout.webcamLayout,
      shouldFadeRecording: false,
    };
  }

  // Same position vertically, webcam can just move to the new position
  if (
    isWebCamRight(otherScene.webcamPosition) ===
    isWebCamRight(currentScene.webcamPosition)
  ) {
    return {
      layout: otherScene.layout.webcamLayout,
      shouldFadeRecording: true,
    };
  }

  // Display is in the way, webcam needs to animate out of the edge
  // and appear from the other side
  if (isWebCamRight(currentScene.webcamPosition)) {
    return {
      layout: {
        ...currentLayout,
        left: canvasWidth + getSafeSpace("landscape"),
      },
      shouldFadeRecording: false,
    };
  }

  return {
    layout: {
      ...currentLayout,
      left: -getSafeSpace("landscape") - currentLayout.width,
    },
    shouldFadeRecording: false,
  };
};
