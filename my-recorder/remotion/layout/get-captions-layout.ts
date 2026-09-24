import type { CanvasLayout, Dimensions } from "../../config/layout";
import { getSafeSpace } from "../../config/layout";
import type { WebcamPosition } from "../../config/scenes";
import {} from "../animations/webcam-transitions";
import {
  isWebCamAtBottom,
  isWebCamRight,
} from "../animations/webcam-transitions/helpers";
import { borderRadius } from "./get-layout";
import type { Layout } from "./layout-types";

export const getCaptionsLayout = ({
  canvasLayout,
  canvasSize,
  webcamLayout,
  webcamPosition,
  displayLayout,
}: {
  canvasLayout: CanvasLayout;
  canvasSize: Dimensions;
  webcamLayout: Layout;
  webcamPosition: WebcamPosition;
  displayLayout: Dimensions | null;
}): Layout | null => {
  if (canvasLayout !== "square") {
    return null;
  }
  if (displayLayout === null) {
    const isTopAligned = !isWebCamAtBottom(webcamPosition);

    return {
      height:
        canvasSize.height -
        webcamLayout.height -
        getSafeSpace(canvasLayout) * 3,
      top: isTopAligned
        ? webcamLayout.height + getSafeSpace(canvasLayout) * 2
        : getSafeSpace(canvasLayout),
      left: getSafeSpace(canvasLayout),
      width: canvasSize.width - getSafeSpace(canvasLayout) * 2,
      borderRadius,
      opacity: 1,
    };
  }

  return {
    height: webcamLayout.height,
    top: webcamLayout.top,
    left: isWebCamRight(webcamPosition)
      ? getSafeSpace(canvasLayout)
      : webcamLayout.width + getSafeSpace(canvasLayout) * 2,
    width:
      canvasSize.width - webcamLayout.width - getSafeSpace(canvasLayout) * 3,
    borderRadius,
    opacity: 1,
  };
};
