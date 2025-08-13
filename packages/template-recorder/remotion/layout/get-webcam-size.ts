import type { CanvasLayout, Dimensions } from "../../config/layout";
import { getSafeSpace } from "../../config/layout";

// TODO: Use this also in the recording interface
const webcamRatio = 400 / 350;

export const getNonFullscreenWebcamSize = ({
  displaySize,
  canvasSize,
  canvasLayout,
}: {
  displaySize: Dimensions;
  canvasSize: Dimensions;
  canvasLayout: CanvasLayout;
}): Dimensions => {
  if (canvasLayout === "square") {
    const remainingHeight =
      canvasSize.height - displaySize.height - getSafeSpace(canvasLayout) * 3;

    return {
      height: remainingHeight,
      width: remainingHeight * (1 / webcamRatio),
    };
  }

  if (canvasLayout === "landscape") {
    const remainingWidth =
      canvasSize.width - displaySize.width - getSafeSpace(canvasLayout) * 3;
    const maxWidth = 350;
    const width = Math.min(remainingWidth, maxWidth);

    const height = webcamRatio * width;

    return {
      width,
      height,
    };
  }

  throw new Error(`Invalid canvas layout ${canvasLayout satisfies never}`);
};
