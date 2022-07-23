import type { PixelFormat } from "./pixel-format";

let currentImageFormat: ImageFormat | undefined;

export const setImageFormat = (format: ImageFormat) => {
  if (typeof format === "undefined") {
    currentImageFormat = undefined;
    return;
  }

  if (!validOptions.includes(format)) {
    throw new TypeError(`Value ${format} is not valid as an image format.`);
  }

  currentImageFormat = format;
};

export const getUserPreferredImageFormat = () => {
  return currentImageFormat;
};
