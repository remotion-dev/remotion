import { webReader } from "@remotion/media-parser/web";
import {
  ConvertMediaProgress,
  convertMedia,
  webcodecsController,
} from "@remotion/webcodecs";
import { getExtension } from "./find-good-supported-codec";
export const convertInBrowser = ({
  src,
  onProgress,
  mimeType,
}: {
  src: Blob;
  onProgress: (progress: ConvertMediaProgress, abort: () => void) => void;
  mimeType: string;
}) => {
  const controller = webcodecsController();

  return convertMedia({
    container: getExtension(mimeType),
    src: new File([src.slice()], `temp`),
    reader: webReader,
    resize: {
      maxHeight: 1080,
      mode: "max-height",
    },
    onProgress: (progress) => {
      onProgress?.(progress, () => controller.abort());
    },
    controller: controller,
  });
};
