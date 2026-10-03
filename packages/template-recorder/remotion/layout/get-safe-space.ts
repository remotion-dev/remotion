import type { CanvasLayout } from "../../config/layout";
import {
  getSafeSpace,
  PORTRAIT_BOTTOM_SAFE_SPACE,
} from "../../config/layout";

export const getBottomSafeSpace = (canvasLayout: CanvasLayout) => {
  if (canvasLayout === "landscape") {
    return 140;
  }

  if (canvasLayout === "portrait") {
    return PORTRAIT_BOTTOM_SAFE_SPACE;
  }

  return getSafeSpace(canvasLayout);
};
