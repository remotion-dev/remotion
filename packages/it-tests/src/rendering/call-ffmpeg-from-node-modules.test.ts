import { RenderInternals } from "@remotion/renderer";
import { execSync } from "child_process";
import path from "path";
import { expect, test } from "vitest";

test("Should be able to call ffmpeg from node_modules (not officially supported)", async () => {
  const binary = RenderInternals.getExecutablePath({
    type: "ffmpeg",
    indent: false,
    logLevel: "info",
    binariesDirectory: null,
  });
  const a = execSync(`${binary} -buildconf`, {
    cwd: path.dirname(binary),
    stdio: "pipe",
  });
  const output = a.toString("utf-8");
  expect(output.includes("--disable-decoders")).toBe(true);
});
