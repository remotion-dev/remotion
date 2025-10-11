import { existsSync, lstatSync, readdirSync } from "node:fs";
import path from "path";
import { CAPTIONS_PREFIX, WEBCAM_PREFIX } from "./config/cameras";
import { captionFile } from "./scripts/captions/caption-file";
import { ensureWhisper } from "./scripts/captions/install-whisper";

await ensureWhisper({
  onInstall: () => undefined,
  onModelProgressInPercent: () => undefined,
  signal: new AbortController().signal,
});

const publicFolder = path.join(process.cwd(), "public");
const foldersInPublicFolder = readdirSync(publicFolder).filter((f) => {
  return lstatSync(path.join(publicFolder, f)).isDirectory();
});

for (const folder of foldersInPublicFolder) {
  const absoluteFolder = path.join(publicFolder, folder);

  const files = readdirSync(absoluteFolder).filter((f) => f !== ".DS_Store");

  for (const file of files) {
    if (!file.startsWith(WEBCAM_PREFIX)) {
      continue;
    }

    const fileToTranscribe = path.join(absoluteFolder, file);

    const outPath = path.join(
      absoluteFolder,
      `${(file.split(".")[0] as string).replace(WEBCAM_PREFIX, CAPTIONS_PREFIX)}.json`,
    );

    if (existsSync(outPath)) {
      console.log("Already transcribed", outPath);
    } else {
      console.log("Transcribing", fileToTranscribe);
      await captionFile({
        file,
        outPath,
        fileToTranscribe,
        onProgress(progress) {
          console.log(`${progress.progressInPercent}%`);
        },
        signal: new AbortController().signal,
      });
      console.log("Transcribed to", outPath);
    }
  }
}
