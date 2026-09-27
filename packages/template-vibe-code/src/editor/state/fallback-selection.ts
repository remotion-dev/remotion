import { createCanvasSelectionController } from "@remotion/canvas";

// Used by components that render before the preview iframe is connected.
export const fallbackSelectionController = createCanvasSelectionController();
