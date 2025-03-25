import path from "path";
import fs from 'fs'
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
  type WhisperModel,
} from "@remotion/install-whisper-cpp";

const WHISPER_VERSION = process.platform === "win32" ? "1.6.0" : "1.7.4";
const WHISPER_MODEL: WhisperModel = "medium";
const WHISPER_PATH = path.join(process.cwd(), "whisper.cpp");

await installWhisperCpp({
  to: WHISPER_PATH,
  version: WHISPER_VERSION,
});

await downloadWhisperModel({
  model: WHISPER_MODEL,
  folder: WHISPER_PATH,
});

// Convert the audio to a 16KHz wav file first if needed:
// import {execSync} from 'child_process';
// execSync('ffmpeg -i /path/to/audio.mp4 -ar 16000 /path/to/audio.wav -y');

const whisperCppOutput = await transcribe({
  model: WHISPER_MODEL,
  whisperPath: WHISPER_PATH,
  inputPath: path.join(process.cwd(), "./public/podcast-audio-16.wav"),
  tokenLevelTimestamps: true,
  language: "German",
  whisperCppVersion: WHISPER_VERSION,
});

// Optional: Apply our recommended postprocessing
const { captions } = toCaptions({
  whisperCppOutput,
});

console.log(JSON.stringify(captions));

fs.writeFileSync(
  path.join(process.cwd(), "./public/captions.json"),
  JSON.stringify(captions, null, 2),
);
