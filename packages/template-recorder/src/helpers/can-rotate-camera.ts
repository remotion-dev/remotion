import type { Dimensions } from "../../config/layout";
import type { SelectedSource } from "./get-selected-video-source";

export const canRotateCamera = ({
  selectedSource,
  preferPortrait,
  resolution,
}: {
  selectedSource: SelectedSource | null;
  preferPortrait: boolean;
  resolution: Dimensions | null;
}) => {
  if (selectedSource === null) {
    return false;
  }

  if (selectedSource.type !== "camera") {
    return false;
  }

  if (resolution === null) {
    return false;
  }

  if (preferPortrait) {
    return (
      selectedSource.maxWidth === null ||
      selectedSource.maxWidth > resolution.width
    );
  }

  return (
    selectedSource.maxHeight === null ||
    selectedSource.maxHeight > resolution.height
  );
};
