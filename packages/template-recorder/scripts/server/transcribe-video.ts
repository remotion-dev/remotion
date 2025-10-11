import { existsSync, readdirSync } from "fs";
import path from "path";
import { CAPTIONS_PREFIX, WEBCAM_PREFIX } from "../../config/cameras";
import { captionFile } from "../captions/caption-file";

export const transcribeVideo = async ({
  endDateAsString,
  folder,
  publicDir,
  onProgress,
  signal,
}: {
  endDateAsString: string;
  folder: string;
  publicDir: string;
  onProgress: (options: {
    filename: string;
    progressInPercent: number;
  }) => void;
  signal: AbortSignal;
}) => {
  if (typeof endDateAsString !== "string") {
    throw new Error("No `endDate` provided");
  }

  if (typeof folder !== "string") {
    throw new Error("No `folder` provided");
  }

  const folderPath = path.join(publicDir, folder);

  // get webcam file of provided end date
  const webcamFiles = readdirSync(folderPath).filter((f) => {
    return (
      f !== ".DS_Store" &&
      f.includes(endDateAsString) &&
      f.startsWith(WEBCAM_PREFIX)
    );
  });

  if (webcamFiles.length === 0) {
    throw new Error(
      `Webcam file ${WEBCAM_PREFIX}${endDateAsString}.mp4 not found.`,
    );
  }

  if (webcamFiles.length > 1) {
    throw new Error("Duplicate files found.");
  }

  const fileName = webcamFiles[0] as string;
  const filePath = path.join(folderPath, fileName);

  const outPath = path.join(
    folderPath,
    `${(fileName.split(".")[0] as string).replace(WEBCAM_PREFIX, CAPTIONS_PREFIX)}.json`,
  );

  if (existsSync(outPath)) {
    return;
  }

  await captionFile({
    file: fileName,
    outPath,
    fileToTranscribe: filePath,
    onProgress,
    signal,
  });
};
