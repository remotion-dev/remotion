import { getSafeSpace } from "../../../config/layout";
import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../config/scenes";
import type { Layout } from "../../layout/layout-types";
import { isWebCamAtBottom, isWebCamRight } from "../webcam-transitions/helpers";

const getEnterAndExitOfFullscreenBox = ({
  scene,
  otherScene,
  canvasHeight,
  canvasWidth,
  subtitleLayout,
}: {
  scene: VideoSceneAndMetadata;
  otherScene: VideoSceneAndMetadata;
  canvasHeight: number;
  canvasWidth: number;
  subtitleLayout: Layout;
}) => {
  if (otherScene === null || otherScene.type !== "video-scene") {
    return subtitleLayout;
  }

  const previouslyAtBottom = isWebCamAtBottom(otherScene.webcamPosition);
  const currentlyAtBottom = isWebCamAtBottom(scene.webcamPosition);
  const changedVerticalPosition = previouslyAtBottom !== currentlyAtBottom;

  // Changing from top to bottom or vice versa will push the subtitle out of the screen
  if (changedVerticalPosition) {
    if (currentlyAtBottom) {
      return {
        ...subtitleLayout,
        top: -subtitleLayout.height,
      };
    }

    return {
      ...subtitleLayout,
      top: canvasHeight,
    };
  }

  // If the vertical position has not changed, and the next scene also
  // has no display video, then nothing changes in the layout
  if (otherScene.layout.displayLayout === null) {
    return otherScene.layout.subtitleLayout as Layout;
  }

  // Now we expect that the other scene has a display video, and the webcam will shrink
  const top = isWebCamAtBottom(scene.webcamPosition)
    ? otherScene.layout.webcamLayout.top -
      subtitleLayout.height -
      getSafeSpace("square")
    : getSafeSpace("square") * 2 + otherScene.layout.webcamLayout.height;

  // If the webcam moves to the top right corner, the subtitle should come from left corner
  if (!isWebCamRight(otherScene.webcamPosition)) {
    return {
      ...subtitleLayout,
      left: -subtitleLayout.width,
      top,
    };
  }

  return {
    ...subtitleLayout,
    left: canvasWidth,
    top,
  };
};

const getEnterAndExitLayoutOfWebcamPositionChange = ({
  otherScene,
  scene,
  canvasHeight,
  canvasWidth,
  subtitleLayout,
}: {
  otherScene: VideoSceneAndMetadata;
  scene: VideoSceneAndMetadata;
  canvasHeight: number;
  canvasWidth: number;
  subtitleLayout: Layout;
}) => {
  if (scene.webcamPosition === otherScene.webcamPosition) {
    return otherScene.layout.subtitleLayout as Layout;
  }

  // Horizontal position change, move the subtitle over the edge
  if (
    isWebCamAtBottom(scene.webcamPosition) !==
    isWebCamAtBottom(otherScene.webcamPosition)
  ) {
    if (isWebCamAtBottom(scene.webcamPosition)) {
      return {
        ...subtitleLayout,
        top: canvasHeight,
      };
    }

    return {
      ...subtitleLayout,
      top: -subtitleLayout.height,
    };
  }

  // Vertical position change
  // Webcam moves from right to left
  if (isWebCamRight(scene.webcamPosition)) {
    return {
      ...subtitleLayout,
      left: -subtitleLayout.width,
    };
  }

  // Webcam moves from left to right
  return {
    ...subtitleLayout,
    left: canvasWidth,
  };
};

const getEnterAndExitOfBentoLayout = ({
  scene,
  otherScene,
  canvasWidth,
  canvasHeight,
  subtitleLayout,
}: {
  otherScene: VideoSceneAndMetadata;
  scene: VideoSceneAndMetadata;
  canvasWidth: number;
  canvasHeight: number;
  subtitleLayout: Layout;
}) => {
  if (!scene.layout.displayLayout) {
    throw new Error("Expected display layout to be present");
  }

  if (otherScene.layout.displayLayout) {
    return getEnterAndExitLayoutOfWebcamPositionChange({
      otherScene,
      scene,
      canvasHeight,
      canvasWidth,
      subtitleLayout,
    });
  }

  // We now assume the other scene has no display, webcam is getting bigger
  // and we need to animate the subtitles out
  const left = isWebCamRight(scene.webcamPosition)
    ? -subtitleLayout.width
    : canvasWidth;

  // Vertical position change
  if (
    isWebCamAtBottom(otherScene.webcamPosition) !==
    isWebCamAtBottom(scene.webcamPosition)
  ) {
    if (isWebCamAtBottom(scene.webcamPosition)) {
      return {
        ...subtitleLayout,
        top: getSafeSpace("square"),
        left,
      };
    }

    return {
      ...subtitleLayout,
      top: canvasHeight - subtitleLayout.height - getSafeSpace("square"),
      left,
    };
  }

  const top = isWebCamAtBottom(scene.webcamPosition)
    ? canvasHeight -
      otherScene.layout.webcamLayout.height -
      getSafeSpace("square")
    : otherScene.layout.webcamLayout.height -
      subtitleLayout.height +
      getSafeSpace("square");

  return {
    ...subtitleLayout,
    left,
    top,
  };
};

export const getSquareEnterOrExit = ({
  scene,
  canvasHeight,
  otherScene,
  canvasWidth,
  subtitleLayout,
}: {
  otherScene: SceneAndMetadata | null;
  scene: VideoSceneAndMetadata;
  canvasWidth: number;
  canvasHeight: number;
  subtitleLayout: Layout;
}): Layout => {
  if (otherScene === null || otherScene.type !== "video-scene") {
    return subtitleLayout;
  }

  if (scene.layout.displayLayout === null) {
    return getEnterAndExitOfFullscreenBox({
      canvasHeight,
      canvasWidth,
      otherScene,
      scene,
      subtitleLayout,
    });
  }

  return getEnterAndExitOfBentoLayout({
    otherScene,
    scene,
    canvasWidth,
    canvasHeight,
    subtitleLayout,
  });
};
