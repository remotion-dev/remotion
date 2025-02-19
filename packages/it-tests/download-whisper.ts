import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
} from "@remotion/install-whisper-cpp";
import path from "path";

const to = path.join(process.cwd(), "whisper.cpp");

await installWhisperCpp({
  to,
  version: "1.5.5",
});

await downloadWhisperModel({
  model: "medium.en",
  folder: to,
  onProgress: (downloadedBytes, totalBytes) => {
    const progress = downloadedBytes / totalBytes;
  },
});

const transcription = await transcribe({
  inputPath: path.join(process.cwd(), "totranscribe.wav"),
  whisperPath: to,
  model: "medium.en",
  tokenLevelTimestamps: true,
  printOutput: false,
  onProgress: (progress) => {
    console.log(progress);
  },
});
