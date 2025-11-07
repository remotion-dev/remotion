import { getMediabunnyOutput } from "./find-good-supported-codec";
import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Output,
} from "mediabunny";

export const convertInBrowser = async ({
  src,
  onProgress,
  mimeType,
}: {
  src: Blob;
  onProgress: (progress: number, abort: () => void) => void;
  mimeType: string;
}) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(src),
  });
  const output = new Output({
    format: getMediabunnyOutput(mimeType),
    target: new BufferTarget(),
  });

  const conversion = await Conversion.init({
    input,
    output,
    video: (videoTrack, n) => {
      if (n > 1) {
        // Keep only the first video track
        return { discard: true };
      }

      return {
        height: Math.min(videoTrack.displayHeight, 1080),
      };
    },
  });

  conversion.onProgress = (progress) => {
    onProgress(progress, () => conversion.cancel());
  };

  if (!conversion.isValid) {
    throw new Error("Conversion is not valid");
  }

  await conversion.execute();
  if (!output.target.buffer) {
    throw new Error("Conversion failed");
  }

  return new Blob([output.target.buffer]);
};
