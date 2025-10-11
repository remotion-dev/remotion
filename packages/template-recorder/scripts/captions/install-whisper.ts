import {
  downloadWhisperModel,
  installWhisperCpp,
} from "@remotion/install-whisper-cpp";
import { WHISPER_MODEL, WHISPER_PATH, WHISPER_REF } from "../../config/whisper";

export const ensureWhisper = async ({
  onInstall,
  onModelProgressInPercent,
  signal,
}: {
  onInstall: () => void;
  onModelProgressInPercent: (progress: number) => void;
  signal: AbortSignal;
}) => {
  const installPromise = installWhisperCpp({
    to: WHISPER_PATH,
    version: WHISPER_REF,
    printOutput: true,
    signal,
  });

  const timeout = setTimeout(() => {
    onInstall();
  }, 1000);

  await installPromise;
  clearTimeout(timeout);

  await downloadWhisperModel({
    model: WHISPER_MODEL,
    folder: WHISPER_PATH,
    printOutput: true,
    onProgress: (downloadedBytes: number, totalBytes: number) => {
      onModelProgressInPercent((downloadedBytes / totalBytes) * 100);
    },
    signal,
  });
};
