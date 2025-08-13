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
