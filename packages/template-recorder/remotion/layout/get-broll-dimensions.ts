import { parseMedia } from "@remotion/media-parser";
import { getImageDimensions } from "@remotion/media-utils";
import type { BRoll, BRollWithDimensions } from "../../config/scenes";

const imageFileExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "svg",
  "ico",
];

const videoFileExtensions = ["mp4", "webm", "mov", "mkv"];

export const getBRollDimensions = async (
  bRoll: BRoll,
): Promise<BRollWithDimensions> => {
  if (
    imageFileExtensions.some((ext) => bRoll.source.toLowerCase().endsWith(ext))
  ) {
    const { width, height } = await getImageDimensions(bRoll.source);
    return {
      ...bRoll,
      type: "image",
      assetWidth: width,
      assetHeight: height,
    };
  }

  if (
    videoFileExtensions.some((ext) => bRoll.source.toLowerCase().endsWith(ext))
  ) {
    const metadata = await parseMedia({
      src: bRoll.source,
      fields: { dimensions: true },
      acknowledgeRemotionLicense: true
    });
    if (!metadata.dimensions) {
      throw new Error("No dimensions found for bRoll: " + bRoll.source);
    }

    return {
      ...bRoll,
      type: "video",
      assetWidth: metadata.dimensions.width,
      assetHeight: metadata.dimensions.height,
    };
  }

  throw new Error(
    `Unsupported file extension for bRoll: ${bRoll.source}. Only ${[...imageFileExtensions, ...videoFileExtensions].join(", ")} are supported.`,
  );
};
