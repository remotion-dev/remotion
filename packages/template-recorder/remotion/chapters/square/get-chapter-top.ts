import type { CanvasLayout } from "../../../config/layout";
import {
  getSafeSpace,
  PORTRAIT_BOTTOM_SAFE_SPACE,
  PORTRAIT_CAPTION_LANE_HEIGHT,
} from "../../../config/layout";

export const SQUARE_CHAPTER_HEIGHT = 78;

export const getSquareChapterTop = ({
  layoutHeight,
  canvasLayout,
  hasDisplay,
}: {
  layoutHeight: number;
  canvasLayout: CanvasLayout;
  hasDisplay: boolean;
}) => {
  if (canvasLayout === "portrait" && !hasDisplay) {
    return (
      layoutHeight -
      PORTRAIT_BOTTOM_SAFE_SPACE -
      PORTRAIT_CAPTION_LANE_HEIGHT -
      SQUARE_CHAPTER_HEIGHT -
      getSafeSpace(canvasLayout)
    );
  }

  return layoutHeight - SQUARE_CHAPTER_HEIGHT - getSafeSpace(canvasLayout);
};
