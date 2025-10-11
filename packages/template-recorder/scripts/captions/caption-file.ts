import { toCaptions, transcribe } from "@remotion/install-whisper-cpp";
import { spawn } from "child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { EOL, tmpdir } from "os";
import path from "path";
import {
  TRANSCRIPTION_LANGUAGE,
  WHISPER_MODEL,
  WHISPER_PATH,
  WHISPER_REF,
} from "../../config/whisper";

export const captionFile = async ({
  file,
  fileToTranscribe,
  outPath,
  onProgress,
  signal,
}: {
  file: string;
  fileToTranscribe: string;
  outPath: string;
  onProgress: (options: {
    filename: string;
    progressInPercent: number;
  }) => void;
  signal: AbortSignal;
}): Promise<void> => {
  const tmpDir = path.join(tmpdir(), "remotion-recorder");

  if (!existsSync(tmpDir)) {
    mkdirSync(tmpDir);
  }

  const wavFile = path.join(tmpDir, `${file.split(".")[0]}.wav`);

  onProgress({ filename: file, progressInPercent: 0 });

  // extracting audio from mp4 and save it as 16khz wav file
  await new Promise<void>((resolve, reject) => {
    const command = `bunx remotion ffmpeg -hide_banner -i ${fileToTranscribe} -ar 16000 -y ${wavFile}`;
    const [bin, ...args] = command.split(" ");
    const child = spawn(bin as string, args, {
      stdio: "ignore",
      signal: signal ?? undefined,
    });

    child.on("exit", (code, signal) => {
      if (code !== 0) {
        reject(new Error(`Exit code ${code} (signal ${signal})`));
        return;
      }
      resolve();
    });
  });

  const whisperCppOutput = await transcribe({
    inputPath: wavFile,
    model: WHISPER_MODEL,
    tokenLevelTimestamps: true,
    whisperPath: WHISPER_PATH,
    translateToEnglish: false,
    printOutput: true,
    onProgress: (progress) => {
      onProgress({
        filename: file,
        progressInPercent: Math.round(progress * 100),
      });
    },
    signal: signal,
    language: TRANSCRIPTION_LANGUAGE,
    whisperCppVersion: WHISPER_REF,
  });

  const { captions } = toCaptions({ whisperCppOutput: whisperCppOutput });

  rmSync(wavFile);
  writeFileSync(outPath, JSON.stringify(captions, null, 2) + EOL);
};
