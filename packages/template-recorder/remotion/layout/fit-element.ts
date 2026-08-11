import type { Dimensions } from "@remotion/layout-utils";
import type { Rect } from "./layout-types";

// Resize an aspect ratio to fit into a container
// and center it
export const fitElementSizeInContainer = ({
  containerSize,
  elementSize,
}: {
  containerSize: Dimensions;
  elementSize: Dimensions;
}): Rect => {
  const heightRatio = containerSize.height / elementSize.height;
  const widthRatio = containerSize.width / elementSize.width;

  const ratio = Math.min(heightRatio, widthRatio);

  const newWidth = elementSize.width * ratio;
  const newHeight = elementSize.height * ratio;

  if (
    newWidth > containerSize.width + 0.000001 ||
    newHeight > containerSize.height + 0.000001
  ) {
    throw new Error(
      `Element is too big to fit into the container. Max size: ${containerSize.width}x${containerSize.height}, element size: ${newWidth}x${newHeight}`,
    );
  }

  return {
    width: newWidth,
    height: newHeight,
    top: (containerSize.height - newHeight) / 2,
    left: (containerSize.width - newWidth) / 2,
  };
};
