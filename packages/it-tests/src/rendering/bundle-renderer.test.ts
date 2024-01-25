import { BundlerInternals } from "@remotion/bundler";
import { execSync } from "node:child_process";
import { RenderInternals } from "@remotion/renderer";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "vitest";
import { exampleVideos } from "./example-videos";
import { copyFileSync, cpSync, rmSync } from "node:fs";

test("Should be able to bundle the renderer", () => {
  const outputdir = path.join(tmpdir(), `test-${Math.random()}`);
  const outfile = path.join(outputdir, "esbuild-test.js");

  const { errors, warnings } = BundlerInternals.esbuild.buildSync({
    platform: "node",
    target: "node16",
    bundle: true,
    outfile,
    entryPoints: [`${__dirname}/test-index.ts`],
  });
  expect(errors.length).toBe(0);
  expect(warnings.length).toBe(0);
  const binaryPath = RenderInternals.getExecutablePath(
    "compositor",
    false,
    "info"
  );
  const ffmpegCwd = path.join(path.dirname(binaryPath), "ffmpeg");

  copyFileSync(binaryPath, path.join(outputdir, path.basename(binaryPath)));
  cpSync(ffmpegCwd, path.join(outputdir, path.basename(ffmpegCwd)), {
    recursive: true,
  });

  const out = execSync("node " + outfile + " " + exampleVideos.bigBuckBunny);
  expect(out.toString("utf8")).toBe("h264\n");

  rmSync(outputdir, {
    recursive: true,
  });
});
