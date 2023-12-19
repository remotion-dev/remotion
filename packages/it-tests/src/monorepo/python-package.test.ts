import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { expect, test } from "vitest";
import { LambdaInternals } from "@remotion/lambda";

const referenceVersion = readFileSync(
  path.join(process.cwd(), "..", "core", "package.json"),
  "utf-8"
);
const referenceVersionJson = JSON.parse(referenceVersion);
const version = referenceVersionJson.version;

test("Set the right version for pytest", () => {
  expect(typeof version).toBe("string");

  const VERSION =
    `# pylint: disable=missing-module-docstring, missing-final-newline\n` +
    `VERSION = "${version}"`;
  writeFileSync(
    path.join(
      process.cwd(),
      "..",
      "lambda-python",
      "remotion_lambda",
      "version.py"
    ),
    VERSION
  );
});

test("Python package should create the same renderMedia payload as normal Lambda package", async () => {
  const cwd = path.join(process.cwd(), "..", "lambda-python");
  const pythonOutput = execSync(
    "python -m pytest -rP  tests/test_render_client.py",
    {
      cwd,
    }
  );
  const output = pythonOutput.toString().split("\n");
  const toParse = output[10];
  const nativeVersion = await LambdaInternals.makeLambdaRenderMediaPayload({
    region: "us-east-1",
    composition: "react-svg",
    functionName: "remotion-render",
    serveUrl: "testbed",
    codec: "h264",
    inputProps: {
      hi: "there",
    },
    audioBitrate: null,
    audioCodec: null,
    chromiumOptions: {},
    colorSpace: "default",
    concurrencyPerLambda: 1,
    crf: undefined,
    deleteAfter: null,
    downloadBehavior: { type: "play-in-browser" },
    envVariables: {},
    everyNthFrame: 1,
    forceBucketName: null,
    forceHeight: null,
    forceWidth: null,
    frameRange: null,
    framesPerLambda: null,
    imageFormat: "jpeg",
    jpegQuality: 80,
    logLevel: "info",
    maxRetries: 1,
    muted: false,
    numberOfGifLoops: 0,
    offthreadVideoCacheSizeInBytes: null,
    outName: null,
    overwrite: false,
    pixelFormat: undefined,
    privacy: "public",
    proResProfile: undefined,
    rendererFunctionName: null,
    scale: 1,
    timeoutInMilliseconds: 30000,
    videoBitrate: null,
    encodingMaxRate: null,
    encodingBufferSize: null,
    webhook: null,
    x264Preset: null,
  });
  const jsonOutput = toParse.substring(0, toParse.lastIndexOf("}") + 1);
  const parsedJson = JSON.parse(jsonOutput);

  expect(
    removeUndefined({
      ...parsedJson,
      type: "start",
    })
  ).toEqual(removeUndefined(nativeVersion));
});

test("Python package should create the same progress payload as normal Lambda package", async () => {
  const cwd = path.join(process.cwd(), "..", "lambda-python");
  const pythonOutput = execSync(
    "python -m pytest -rP  tests/test_get_render_progress_client.py",
    {
      cwd,
    }
  );
  const output = pythonOutput.toString().split("\n");
  const toParse = output[10];
  const nativeVersion = LambdaInternals.getRenderProgressPayload({
    region: "us-east-1",
    functionName: "remotion-render",
    bucketName: "remotion-render",
    renderId: "abcdef",
  });
  const jsonOutput = toParse.substring(0, toParse.lastIndexOf("}") + 1);
  const parsedJson = JSON.parse(jsonOutput);
  expect(parsedJson).toEqual({ ...nativeVersion, s3OutputProvider: null });
});

const removeUndefined = (data: unknown) => {
  return JSON.parse(JSON.stringify(data));
};
