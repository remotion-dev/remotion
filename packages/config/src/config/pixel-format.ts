import { PixelFormat, RenderInternals, Codec } from "@remotion/renderer";

let currentPixelFormat: PixelFormat = DEFAULT_PIXEL_FORMAT;

export const setPixelFormat = (format: PixelFormat) => {
  if (!RenderInternals.validPixelFormats.includes(format)) {
    throw new TypeError(`Value ${format} is not valid as a pixel format.`);
  }

  currentPixelFormat = format;
};

export const getPixelFormat = () => {
  return currentPixelFormat;
};
