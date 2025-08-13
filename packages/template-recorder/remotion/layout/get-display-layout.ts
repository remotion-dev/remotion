import type { CanvasLayout } from "../../config/layout";
import { getSafeSpace, type Dimensions } from "../../config/layout";
import type { WebcamPosition } from "../../config/scenes";
import {
  isWebCamAtBottom,
  isWebCamRight,
} from "../animations/webcam-transitions/helpers";
import { borderRadius, fullscreenLayout } from "./get-layout";
import type {
  BRollEnterDirection,
  Layout,
  RecordingsLayout,
} from "./layout-types";

const getYForDisplayLayout = ({
  webcamPosition,
  canvasSize,
  displayHeight,
}: {
  webcamPosition: WebcamPosition;
  canvasSize: Dimensions;
  displayHeight: number;
}): number => {
  if (isWebCamAtBottom(webcamPosition)) {
    return getSafeSpace("square");
  }

  return canvasSize.height - displayHeight - getSafeSpace("square");
};

export const getSquareDisplayLayout = ({
  canvasSize,
  webcamPosition,
  displaySize,
}: {
  canvasSize: Dimensions;
  webcamPosition: WebcamPosition;
  displaySize: Dimensions;
}): Layout => {
  return {
    left: (canvasSize.width - displaySize.width) / 2,
    top: getYForDisplayLayout({
      webcamPosition,
      canvasSize,
      displayHeight: displaySize.height,
    }),
    width: displaySize.width,
    height: displaySize.height,
    borderRadius,
    opacity: 1,
  };
};

export const getSquareBRollLayout = ({
  canvasSize,
  webcamPosition,
  displaySize,
}: {
  canvasSize: Dimensions;
  webcamPosition: WebcamPosition;
  displaySize: Dimensions;
}): { bRollLayout: Layout; bRollEnterDirection: BRollEnterDirection } => {
  return {
    bRollEnterDirection: isWebCamAtBottom(webcamPosition) ? "top" : "bottom",
    bRollLayout: {
      left: getSafeSpace("square"),
      top: getYForDisplayLayout({
        webcamPosition,
        canvasSize,
        displayHeight: displaySize.height,
      }),
      width: canvasSize.width - getSafeSpace("square") * 2,
      height: displaySize.height,
      borderRadius,
      opacity: 1,
    },
  };
};

export const getLandscapeDisplayAndWebcamLayout = ({
  webcamSize,
  canvasLayout,
  canvasSize,
  webcamPosition,
}: {
  webcamSize: Dimensions;
  canvasLayout: CanvasLayout;
  canvasSize: Dimensions;
  webcamPosition: WebcamPosition;
}): RecordingsLayout => {
  const displayLayout: Layout = fullscreenLayout(canvasSize);

  const webcamLayout: Layout = {
    borderRadius,
    height: webcamSize.height,
    width: webcamSize.width,
    opacity: 1,
    left: isWebCamRight(webcamPosition)
      ? canvasSize.width - webcamSize.width - getSafeSpace(canvasLayout)
      : getSafeSpace("landscape"),
    top: isWebCamAtBottom(webcamPosition)
      ? canvasSize.height - webcamSize.height - getSafeSpace(canvasLayout)
      : getSafeSpace("landscape"),
  };

  return {
    displayLayout,
    webcamLayout,
    bRollLayout: displayLayout,
    bRollEnterDirection: isWebCamAtBottom(webcamPosition) ? "top" : "bottom",
  };
};
