import type { CanvasLayout } from "../../../config/layout";
import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../config/scenes";
import type { Layout, LayoutAndFade } from "../../layout/layout-types";
import { interpolateLayoutAndFade } from "../interpolate-layout";
import { getLandscapeDisplayEnterOrExit } from "./landscape";
import { getSquareDisplayEnterOrExit } from "./square";

const getDisplayStartOrEndLayout = ({
  currentScene,
  otherScene,
  canvasWidth,
  canvasHeight,
  canvasLayout,
}: {
  otherScene: SceneAndMetadata | null;
  currentScene: VideoSceneAndMetadata;
  canvasWidth: number;
  canvasHeight: number;
  canvasLayout: CanvasLayout;
}): LayoutAndFade => {
  if (canvasLayout === "landscape") {
    return getLandscapeDisplayEnterOrExit({
      currentScene,
      otherScene,
    });
  }

  if (canvasLayout === "square") {
    return getSquareDisplayEnterOrExit({
      currentScene,
      otherScene,
      canvasWidth,
      canvasHeight,
    });
  }

  throw new Error(`Unknown canvas layout: ${canvasLayout satisfies never}`);
};

const getDisplayTransitionOrigins = ({
  currentScene,
  nextScene,
  previousScene,
  canvasWidth,
  canvasHeight,
  canvasLayout,
}: {
  nextScene: SceneAndMetadata | null;
  previousScene: SceneAndMetadata | null;
  currentScene: VideoSceneAndMetadata;
  canvasLayout: CanvasLayout;
  canvasWidth: number;
  canvasHeight: number;
}) => {
  const enter = getDisplayStartOrEndLayout({
    currentScene,
    otherScene: previousScene,
    canvasWidth,
    canvasLayout,
    canvasHeight,
  });

  const exit = getDisplayStartOrEndLayout({
    currentScene,
    otherScene: nextScene,
    canvasWidth,
    canvasHeight,
    canvasLayout,
  });

  return {
    enter,
    exit,
  };
};

export const getDisplayPosition = ({
  enterProgress,
  exitProgress,
  canvasWidth,
  canvasHeight,
  nextScene,
  previousScene,
  currentScene,
  canvasLayout,
}: {
  enterProgress: number;
  exitProgress: number;
  canvasWidth: number;
  canvasHeight: number;
  previousScene: SceneAndMetadata | null;
  nextScene: SceneAndMetadata | null;
  currentScene: VideoSceneAndMetadata;
  canvasLayout: CanvasLayout;
}): Layout => {
  if (
    currentScene.type !== "video-scene" ||
    currentScene.layout.displayLayout === null
  ) {
    throw new Error("no transitions on non-video scenes");
  }

  const { enter, exit } = getDisplayTransitionOrigins({
    currentScene,
    nextScene,
    previousScene,
    canvasWidth,
    canvasHeight,
    canvasLayout,
  });

  if (exitProgress > 0) {
    return interpolateLayoutAndFade(
      currentScene.layout.displayLayout,
      exit.layout,
      exitProgress,
      false,
    );
  }

  return interpolateLayoutAndFade(
    enter.layout,
    currentScene.layout.displayLayout,
    enterProgress,
    enter.shouldFadeRecording,
  );
};
