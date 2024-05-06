import { Box } from "./parse-video";

export const getDuration = (boxes: Box[]): number | null => {
  const moovBox = boxes.find((b) => b.boxType === "moov");
  if (!moovBox) {
    return null;
  }
  const extraData = moovBox.extraData;
  if (!extraData) {
    return null;
  }

  if (extraData.type !== "boxes") {
    return null;
  }

  const mvhdBox = extraData.boxes.find((b) => b.boxType === "mvhd");
  if (!mvhdBox || !mvhdBox.extraData) {
    return null;
  }

  if (mvhdBox.extraData.type !== "mvhd-box") {
    throw new Error("Expected mvhd-box");
  }

  return mvhdBox.extraData.box.durationInSeconds;
};
