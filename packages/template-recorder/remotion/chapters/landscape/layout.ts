import React from "react";
import { getSafeSpace } from "../../../config/layout";
import type { VideoSceneAndMetadata } from "../../../config/scenes";
import {} from "../../animations/webcam-transitions";
import {
  isWebCamAtBottom,
  isWebCamRight,
} from "../../animations/webcam-transitions/helpers";
import type { Layout } from "../../layout/layout-types";

const getWidescreenChapterLayout = (
  scene: VideoSceneAndMetadata,
  tableOfContentHeight: number,
): React.CSSProperties => {
  const { layout, webcamPosition } = scene;

  if (webcamPosition === "center") {
    return {
      height: 1000,
      borderRadius: 0,
      opacity: 1,
      left: getSafeSpace("landscape"),
      bottom: getSafeSpace("landscape"),
      width: 10000,
      top: undefined,
    };
  }

  const rightAligned = isWebCamRight(webcamPosition);
  const bottomAligned = isWebCamAtBottom(webcamPosition);

  const chapterLayout: Layout = {
    height: 1000,
    borderRadius: 0,
    opacity: 1,
    ...(rightAligned
      ? {
          left: 0,
          width: layout.webcamLayout.left + layout.webcamLayout.width,
        }
      : { left: layout.webcamLayout.left, width: 100000 }),
    ...(bottomAligned
      ? {
          top:
            layout.webcamLayout.top -
            tableOfContentHeight -
            getSafeSpace("landscape"),
          bottom: undefined,
        }
      : {
          top:
            getSafeSpace("landscape") +
            layout.webcamLayout.top +
            layout.webcamLayout.height,
          bottom: undefined,
        }),
  };

  return chapterLayout;
};

export const getWidescreenChapterStyle = (
  scene: VideoSceneAndMetadata,
  tableOfContentHeight: number,
): React.CSSProperties => {
  const chapterLayout = getWidescreenChapterLayout(scene, tableOfContentHeight);

  const rightAligned = isWebCamRight(
    scene.webcamPosition === "center" ? "bottom-left" : scene.webcamPosition,
  );

  return {
    ...chapterLayout,
    ...(rightAligned
      ? {
          alignSelf: "flex-end",
          alignItems: "flex-end",
        }
      : {}),
  };
};
