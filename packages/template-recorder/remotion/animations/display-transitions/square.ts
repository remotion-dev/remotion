import { getSafeSpace } from "../../../config/layout";
import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../config/scenes";
import type { LayoutAndFade } from "../../layout/layout-types";
import { isWebCamAtBottom } from "../webcam-transitions/helpers";

export const getSquareDisplayEnterOrExit = ({
  currentScene,
  otherScene,
  canvasHeight,
  canvasWidth,
}: {
  otherScene: SceneAndMetadata | null;
  currentScene: VideoSceneAndMetadata;
  canvasWidth: number;
  canvasHeight: number;
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

  if (otherScene.layout.displayLayout !== null) {
    return {
      layout: otherScene.layout.displayLayout,
      shouldFadeRecording: true,
    };
  }

  // Assuming now: currentScene is a display video that needs to be moved in
  // the canvas because other scene had no display video

  // 1. From bottom left/right to top: Display should disappear top edge
  if (
    isWebCamAtBottom(currentScene.webcamPosition) &&
    !isWebCamAtBottom(otherScene.webcamPosition)
  ) {
    return {
      layout: {
        ...currentScene.layout.displayLayout,
        top: -currentScene.layout.displayLayout.height,
      },
      shouldFadeRecording: false,
    };
  }

  // 2. From top to bottom left/right: Display should appear from bottom edge
  if (
    !isWebCamAtBottom(currentScene.webcamPosition) &&
    isWebCamAtBottom(otherScene.webcamPosition)
  ) {
    return {
      layout: {
        ...currentScene.layout.displayLayout,
        top: canvasHeight,
      },
      shouldFadeRecording: false,
    };
  }

  // 3. From top right to top: Should slide display to left
  if (currentScene.webcamPosition === "top-right") {
    return {
      layout: {
        ...currentScene.layout.displayLayout,
        left: -currentScene.layout.displayLayout.width,
        top: otherScene.layout.webcamLayout.height + getSafeSpace("square") * 2,
      },
      shouldFadeRecording: false,
    };
  }

  // 4. From top left to top: Should slide display to right
  if (currentScene.webcamPosition === "top-left") {
    return {
      layout: {
        ...currentScene.layout.displayLayout,
        left: canvasWidth,
        top: otherScene.layout.webcamLayout.height + getSafeSpace("square") * 2,
      },
      shouldFadeRecording: false,
    };
  }

  // 5. From bottom left to bottom: Display should disappear to right
  if (currentScene.webcamPosition === "bottom-left") {
    return {
      layout: {
        ...currentScene.layout.displayLayout,
        left: canvasWidth,
        top:
          canvasHeight -
          currentScene.layout.displayLayout.height -
          otherScene.layout.webcamLayout.height -
          getSafeSpace("square") * 2,
      },
      shouldFadeRecording: false,
    };
  }

  // 6. From bottom right to bottom: Display should disappear to left
  if (currentScene.webcamPosition === "bottom-right") {
    return {
      layout: {
        ...currentScene.layout.displayLayout,
        left: -currentScene.layout.displayLayout.width,
        top:
          canvasHeight -
          currentScene.layout.displayLayout.height -
          otherScene.layout.webcamLayout.height -
          getSafeSpace("square") * 2,
      },
      shouldFadeRecording: false,
    };
  }

  throw new Error("Unhandled case");
};
