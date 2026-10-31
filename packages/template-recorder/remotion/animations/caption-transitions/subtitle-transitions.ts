import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../config/scenes";
import type { Layout } from "../../layout/layout-types";
import { interpolateLayout } from "../interpolate-layout";
import { getSquareEnterOrExit } from "./square";

export const getSubtitleTransform = ({
  enterProgress,
  exitProgress,
  canvasWidth,
  canvasHeight,
  nextScene,
  previousScene,
  scene,
  subtitleLayout,
}: {
  enterProgress: number;
  exitProgress: number;
  canvasWidth: number;
  canvasHeight: number;
  scene: VideoSceneAndMetadata;
  previousScene: SceneAndMetadata | null;
  nextScene: SceneAndMetadata | null;
  subtitleLayout: Layout;
}): Layout => {
  // Portrait captions stay in the reserved platform-safe lane across scenes.
  // The square transition helpers inspect corner positions, but camera-only
  // portrait scenes use a centered webcam position.
  if (canvasHeight > canvasWidth) {
    return subtitleLayout;
  }

  const enter = getSquareEnterOrExit({
    scene,
    otherScene: previousScene,
    canvasHeight,
    canvasWidth,
    subtitleLayout,
  });

  const exit = getSquareEnterOrExit({
    scene,
    otherScene: nextScene,
    canvasWidth,
    canvasHeight,
    subtitleLayout,
  });

  if (exitProgress > 0) {
    return interpolateLayout(subtitleLayout, exit, exitProgress);
  }

  return interpolateLayout(enter, subtitleLayout, enterProgress);
};
