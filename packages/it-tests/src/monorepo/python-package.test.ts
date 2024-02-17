import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { expect, test } from "vitest";
import { LambdaInternals } from "@remotion/lambda";

const PYTHON_OUTPUT_MARKER = 10;
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
    "python -m pytest -rP  tests/test_render_client_render_media.py",
    {
      cwd,
      //stdio: "inherit",
    }
  );
  const output = pythonOutput.toString().split("\n");
  const toParse = output[PYTHON_OUTPUT_MARKER];
  const nativeVersion = await LambdaInternals.makeLambdaRenderMediaPayload({
    region: "us-east-1",
    composition: "react-svg",
    functionName: "remotion-render",
    serveUrl: "testbed",
    codec: "h264",
    inputProps: {
      hi: "there",
    },
    audioBitrate: "320k",
    audioCodec: null,
    chromiumOptions: {},
    colorSpace: "default",
    concurrencyPerLambda: 1,
    crf: undefined,
    deleteAfter: null,
    downloadBehavior: {
      fileName: "hi",
      type: "download",
    },
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
    webhook: {
      secret: "abc",
      url: "https://example.com",
      customData: {
        hi: "there",
      },
    },
    x264Preset: "medium",
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
      //stdio: "inherit",
    }
  );
  const output = pythonOutput.toString().split("\n");
  const toParse = output[PYTHON_OUTPUT_MARKER];
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

test("Python package should create the same renderStill payload as normal Lambda package", async () => {
  const cwd = path.join(process.cwd(), "..", "lambda-python");
  const pythonOutput = execSync(
    "python -m pytest -rP  tests/test_render_client_render_still.py",
    {
      cwd,
      //stdio: "inherit",
    }
  );
  const output = pythonOutput.toString().split("\n");
  const toParse = output[PYTHON_OUTPUT_MARKER];
  const nativeVersion = await LambdaInternals.makeLambdaRenderStillPayload({
    region: "us-east-1",
    composition: "still-helloworld",
    functionName: "remotion-render",
    serveUrl: "testbed",
    inputProps: {
      message: "Hello from props!",
    },
    chromiumOptions: {},
    deleteAfter: null,
    downloadBehavior: { type: "play-in-browser" },
    envVariables: {},
    forceBucketName: undefined,
    forceHeight: null,
    forceWidth: null,
    imageFormat: "jpeg",
    jpegQuality: 80,
    logLevel: "info",
    maxRetries: 1,
    offthreadVideoCacheSizeInBytes: null,
    outName: undefined,
    privacy: "public",
    scale: 1,
    timeoutInMilliseconds: 30000,
    videoBitrate: null,
  });
  const jsonOutput = toParse.substring(0, toParse.lastIndexOf("}") + 1);
  const parsedJson = JSON.parse(jsonOutput);
  // remove the bucketName field because request input does not have that value
  // forceBucketName is being set in bucketName
  const { bucketName, ...newObject } = nativeVersion;
  const assertValue = {
    ...newObject,
    forceBucketName: nativeVersion.bucketName,
  };
  expect(
    removeUndefined({
      ...parsedJson,
    })
  ).toEqual(removeUndefined(assertValue));
});
const removeUndefined = (data: unknown) => {
  return JSON.parse(JSON.stringify(data));
};
