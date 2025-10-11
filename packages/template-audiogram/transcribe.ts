import path from "path";
import fs from "fs";
import os from "os";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
  type WhisperModel,
  type Language,
} from "@remotion/install-whisper-cpp";
import { execSync } from "child_process";
import * as readline from "readline";

const SPEECH_START_SECONDS_DEFAULT = 0;
const DEFAULT_AUDIO_PATH = "./public/audio.wav";

interface TranscriptionOptions {
  audioPath: string;
  speechStartsAtSecond: number;
  language?: Language;
}

async function askQuestions(
  rl: readline.Interface,
): Promise<TranscriptionOptions> {
  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  // Ask for audio file path
  const audioPath =
    (await question(
      `❓ Path to audio file (default: ${DEFAULT_AUDIO_PATH}): `,
    )) || DEFAULT_AUDIO_PATH;

  // Ask for speech start time - this helps avoid false triggers from background music/noise
  const speechStartStr = await question(
    `❓ At what second does the actual speech begin? (default: ${SPEECH_START_SECONDS_DEFAULT}): `,
  );
  const speechStartsAtSecond = speechStartStr
    ? parseFloat(speechStartStr)
    : SPEECH_START_SECONDS_DEFAULT;

  return {
    audioPath,
    speechStartsAtSecond,
  };
}

async function transcribeAudio(options: TranscriptionOptions) {
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

  // Create a temporary audio file with the speech start cut out and converted to 16-bit WAV
  const tempAudioForWhisper = path.join(
    os.tmpdir(),
    `whisper-${Date.now()}.wav`,
  );

  // Cut the audio starting from speech start time and convert to 16-bit WAV
  execSync(
    `npx remotion ffmpeg -i "${options.audioPath}" -ss ${options.speechStartsAtSecond} -ar 16000 -ac 1 "${tempAudioForWhisper}" -y`,
  );

  const whisperCppOutput = await transcribe({
    model: WHISPER_MODEL,
    whisperPath: WHISPER_PATH,
    inputPath: tempAudioForWhisper,
    tokenLevelTimestamps: true,
    language: options.language || "English",
    whisperCppVersion: WHISPER_VERSION,
  });

  // Optional: Apply our recommended postprocessing
  const { captions } = toCaptions({
    whisperCppOutput,
  });

  const offsetInMillis = options.speechStartsAtSecond * 1000;

  // Shift all timestamps forward by speech start time
  const adjustedCaptions = captions.map((caption) => ({
    ...caption,
    startMs: caption.startMs + offsetInMillis,
    endMs: caption.endMs + offsetInMillis,
    timestampMs: caption.timestampMs
      ? caption.timestampMs + offsetInMillis
      : null,
  }));

  fs.writeFileSync(
    path.join(process.cwd(), "./public/captions.json"),
    JSON.stringify(adjustedCaptions, null, 2),
  );

  console.info(
    "Transcription complete. Check the captions.json file for the results.",
  );

  // Clean up temporary file
  fs.unlinkSync(tempAudioForWhisper);

  return adjustedCaptions;
}

async function startTranscribe() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const options = await askQuestions(rl);
    await transcribeAudio(options);
  } finally {
    // Close readline interface
    rl.close();
  }
}

// Only run the CLI if this file is run directly
if (require.main === module) {
  startTranscribe();
}

export { transcribeAudio, type TranscriptionOptions };
