import type { CanvasLayout, Dimensions } from "../../config/layout";
import { DIMENSIONS } from "../../config/layout";

export const getDimensionsForLayout = (
  canvasLayout: CanvasLayout,
): Dimensions => {
  return DIMENSIONS[canvasLayout];
};
