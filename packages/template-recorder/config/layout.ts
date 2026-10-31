import { z } from "zod";

export type Dimensions = {
  width: number;
  height: number;
};

export const canvasLayout = z.enum(["landscape", "square", "portrait"]);
export type CanvasLayout = z.infer<typeof canvasLayout>;

export const PORTRAIT_BOTTOM_SAFE_SPACE = 320;
export const PORTRAIT_CAPTION_LANE_HEIGHT = 260;
export const PORTRAIT_CAPTION_SIDE_SAFE_SPACE = 72;

export const DIMENSIONS: { [key in CanvasLayout]: Dimensions } = {
  landscape: {
    width: 1920,
    height: 1080,
  },
  square: {
    width: 1080,
    height: 1080,
  },
  portrait: {
    width: 1080,
    height: 1920,
  },
};

export const LANDSCAPE_DISPLAY_MAX_WIDTH_OF_CANVAS = 0.77;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getSafeSpace = (_canvasLayout: CanvasLayout) => 30;
