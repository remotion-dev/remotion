import {
  downloadWhisperModel,
  installWhisperCpp,
} from "@remotion/install-whisper-cpp";
import path from "path";

const to = path.join(process.cwd(), "whisper.cpp");

await installWhisperCpp({
  to,
  version: "1.5.5",
});

await downloadWhisperModel({
  model: "large-v3",
  folder: to,
});
