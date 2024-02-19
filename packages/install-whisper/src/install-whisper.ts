import fs from "fs";
import { execSync } from "node:child_process";
import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";
import { finished } from "node:stream/promises";
import path from "path";

const installForWindows = async ({
  version,
  to,
}: {
  version: string;
  to: string;
}) => {
  const url = `https://github.com/ggerganov/whisper.cpp/releases/download/v${version}/whisper-bin-x64.zip`;

  const filePath = path.join(process.cwd(), "whisper-bin-x64.zip");
  const fileStream = fs.createWriteStream(filePath);

  const { body } = await fetch(url);
  if (body === null) {
    throw new Error("Failed to download whisper binary");
  }

  await finished(Readable.fromWeb(body as ReadableStream).pipe(fileStream));

  execSync(`Expand-Archive -Force ${filePath} ${to}`, {
    shell: "powershell",
    stdio: "inherit",
  });
};

const installWhisperForUnix = ({
  version,
  to,
}: {
  version: string;
  to: string;
}) => {
  execSync(`git clone https://github.com/ggerganov/whisper.cpp.git ${to}`, {
    stdio: "inherit",
  });

  execSync(`git checkout v${version}`, {
    stdio: "inherit",
    cwd: to,
  });

  execSync(`make`, {
    cwd: to,
    stdio: "inherit",
  });
};

export const installWhisper = async ({
  version,
  to,
}: {
  version: string;
  to: string;
}) => {
  if (process.platform === "darwin" || process.platform === "linux") {
    installWhisperForUnix({ version, to });
  }

  if (process.platform === "win32") {
    await installForWindows({ version, to });
  }

  throw new Error(`Unsupported platform: ${process.platform}`);
};
