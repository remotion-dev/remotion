import path from "path";
import fs, { existsSync } from "fs";
import { finished } from "node:stream/promises";
import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";

export type WhisperModel =
  | "tiny"
  | "tiny.en"
  | "base"
  | "base.en"
  | "small"
  | "small.en"
  | "medium"
  | "medium.en"
  | "large-v1"
  | "large-v2"
  | "large";

export const downloadWhisperModel = async ({
  model,
  to,
}: {
  model: WhisperModel;
  to: string;
}) => {
  const filePath = path.join(to, `ggml-${model}.bin`);
  if (existsSync(filePath)) {
    return;
  }

  const baseModelUrl = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`;

  const fileStream = fs.createWriteStream(filePath);

  const { body } = await fetch(baseModelUrl);
  await finished(Readable.fromWeb(body as ReadableStream).pipe(fileStream));
};
