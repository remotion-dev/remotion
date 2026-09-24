import type { Dimensions } from "@remotion/layout-utils";
import type { CanvasLayout } from "../../config/layout";
import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
  WebcamPositionForComparison,
} from "../../config/scenes";

const getComparableWebcamPosition = (
  sceneAndMetaData: VideoSceneAndMetadata,
  canvasLayout: CanvasLayout,
): WebcamPositionForComparison => {
  if (canvasLayout !== "square") {
    return sceneAndMetaData.webcamPosition;
  }

  if (sceneAndMetaData.videos.display) {
    return sceneAndMetaData.webcamPosition;
  }

  if (
    sceneAndMetaData.webcamPosition === "bottom-left" ||
    sceneAndMetaData.webcamPosition === "bottom-right"
  ) {
    return "bottom";
  }

  return "top";
};

const getHasSameSize = (
  first: Dimensions | null,
  second: Dimensions | null,
) => {
  // If both are null, they are the same
  if (first === null && second === null) {
    return true;
  }

  // If only one is null, they are not the same
  if (first === null || second === null) {
    return false;
  }

  return first.height === second.height && second.width === first.width;
};

// Figure out if we are able to do a transition.
// We can do a transition if the layout is not the same.
export const getShouldTransitionOut = ({
  sceneAndMetadata,
  nextSceneAndMetadata,
  canvasLayout,
}: {
  sceneAndMetadata: SceneAndMetadata;
  nextSceneAndMetadata: SceneAndMetadata | null;
  canvasLayout: CanvasLayout;
}) => {
  // Can not transition if this is the last scene
  if (nextSceneAndMetadata === null) {
    return false;
  }

  // Can not transition if it was disabled
  if (!sceneAndMetadata.scene.transitionToNextScene) {
    return false;
  }

  // If not both are video scenes, we can transition (slide)
  if (
    sceneAndMetadata.type !== "video-scene" ||
    nextSceneAndMetadata.type !== "video-scene"
  ) {
    return true;
  }

  // If the webcam position changed, we can transition (move webcam)
  if (
    getComparableWebcamPosition(sceneAndMetadata, canvasLayout) !==
    getComparableWebcamPosition(nextSceneAndMetadata, canvasLayout)
  ) {
    return true;
  }

  // We can transition if the webcam size has changed
  if (
    !getHasSameSize(
      sceneAndMetadata.layout.webcamLayout,
      nextSceneAndMetadata.layout.webcamLayout,
    )
  ) {
    return true;
  }

  // If display is not the same, we can transition
  if (
    !getHasSameSize(
      sceneAndMetadata.layout.displayLayout,
      nextSceneAndMetadata.layout.displayLayout,
    )
  ) {
    return true;
  }

  // Seems like everything is the same, we can't transition!
  return false;
};

export const getShouldTransitionIn = ({
  sceneAndMetadata: sceneAndMetadata,
  previousSceneAndMetadata,
  canvasLayout,
}: {
  sceneAndMetadata: SceneAndMetadata;
  previousSceneAndMetadata: SceneAndMetadata | null;
  canvasLayout: CanvasLayout;
}) => {
  if (previousSceneAndMetadata === null) {
    return false;
  }

  return getShouldTransitionOut({
    sceneAndMetadata: previousSceneAndMetadata,
    nextSceneAndMetadata: sceneAndMetadata,
    canvasLayout,
  });
};
