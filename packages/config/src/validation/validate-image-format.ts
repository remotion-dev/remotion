import type { ImageFormat } from "../config";

export const validateNonNullImageFormat = (imageFormat: ImageFormat) => {
  if (imageFormat !== "jpeg" && imageFormat !== "png") {
    throw new TypeError('Image format should be either "png" or "jpeg"');
  }
};
