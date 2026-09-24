import type { CanvasLayout } from "../../../config/layout";
import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../config/scenes";
import type { Layout, LayoutAndFade } from "../../layout/layout-types";
import { interpolateLayoutAndFade } from "../interpolate-layout";
import { getLandscapeWebCamStartOrEndLayout } from "./landscape";
import { getSquareWebcamStartOrEndLayout } from "./square";

const getWebCamStartOrEndLayout = ({
  canvasWidth,
  canvasHeight,
  canvasLayout,
  otherScene,
  currentScene,
}: {
  otherScene: SceneAndMetadata | null;
  currentScene: VideoSceneAndMetadata;
  canvasWidth: number;
  canvasHeight: number;
  canvasLayout: CanvasLayout;
}): LayoutAndFade => {
  if (canvasLayout === "landscape") {
    return getLandscapeWebCamStartOrEndLayout({
      currentScene,
      otherScene,
      canvasWidth,
    });
  }

  if (canvasLayout === "square") {
    return getSquareWebcamStartOrEndLayout({
      currentScene,
      canvasHeight,
      otherScene,
    });
  }

  throw new Error(`Unknown canvas layout: ${canvasLayout satisfies never}`);
};

export const getWebcamLayout = ({
  enterProgress,
  exitProgress,
  canvasWidth,
  canvasHeight,
  canvasLayout,
  currentScene,
  nextScene,
  previousScene,
}: {
  enterProgress: number;
  exitProgress: number;
  canvasWidth: number;
  canvasHeight: number;
  canvasLayout: CanvasLayout;
  nextScene: SceneAndMetadata | null;
  currentScene: VideoSceneAndMetadata;
  previousScene: SceneAndMetadata | null;
}): Layout => {
  const startLayout = getWebCamStartOrEndLayout({
    canvasLayout,
    currentScene,
    otherScene: previousScene,
    canvasWidth,
    canvasHeight,
  });

  const endLayout = getWebCamStartOrEndLayout({
    canvasLayout,
    currentScene,
    canvasHeight,
    otherScene: nextScene,
    canvasWidth,
  });

  if (exitProgress > 0) {
    return interpolateLayoutAndFade(
      currentScene.layout.webcamLayout,
      endLayout.layout,
      exitProgress,
      false,
    );
  }

  return interpolateLayoutAndFade(
    startLayout.layout,
    currentScene.layout.webcamLayout,
    enterProgress,
    startLayout.shouldFadeRecording,
  );
};
