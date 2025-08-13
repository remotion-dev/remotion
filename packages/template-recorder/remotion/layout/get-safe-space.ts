import type { CanvasLayout } from "../../config/layout";
import { getSafeSpace } from "../../config/layout";

export const getBottomSafeSpace = (canvasLayout: CanvasLayout) => {
  if (canvasLayout === "landscape") {
    return 140;
  }

  return getSafeSpace(canvasLayout);
};
