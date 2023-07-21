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
  const pythonOutput = execSync("pytest -rP  ./tests/test_render_client.py", {
    cwd: path.join(process.cwd(), "..", "lambda-python"),
  });
  const output = pythonOutput.toString().split("\n");
  console.log(output);
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
  });
  console.log("nativeVersion");
  console.log(nativeVersion);
  const jsonOutput = toParse.substring(0, toParse.lastIndexOf("}") + 1);
  console.log(jsonOutput);
  const parsedJson = JSON.parse(jsonOutput);

  expect(
    removeUndefined({
      ...parsedJson,
      type: "start",
    })
  ).toEqual(removeUndefined(nativeVersion));
});

test("Python package should create the same progress payload as normal Lambda package", async () => {
  const pythonOutput = execSync(
    "pytest -rP  ./tests/test_get_render_progress_client.py",
    {
      cwd: path.join(process.cwd(), "..", "lambda-python"),
    }
  );
  const output = pythonOutput.toString().split("\n");
  console.log(output);
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
