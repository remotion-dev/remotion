import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { expect, test } from "vitest";
import { LambdaInternals } from "@remotion/lambda";

test("Set the right version for gotest", () => {
  const referenceVersion = readFileSync(
    path.join(process.cwd(), "..", "core", "package.json"),
    "utf-8"
  );

  const referenceVersionJson = JSON.parse(referenceVersion);
  const version = referenceVersionJson.version;
  expect(typeof version).toBe("string");

  const VERSION = `package lambda_go_sdk;\n\nconst VERSION = "${version}"`;
  writeFileSync(
    path.join(process.cwd(), "..", "lambda-go", "version.go"),
    VERSION
  );
});

test("Go package should create the same payload as normal Lambda package", async () => {
  const goOutput = execSync("go test", {
    cwd: path.join(process.cwd(), "..", "lambda-go"),
  });
  const firstLine = goOutput.toString().split("\n")[0];
  const parsed = JSON.parse(firstLine);

  const nativeVersion = await LambdaInternals.makeLambdaRenderMediaPayload({
    region: "us-east-1",
    composition: "react-svg",
    functionName: "remotion-render",
    serveUrl: "testbed",
    codec: "h264",
  });

  expect(removeUndefined(parsed)).toEqual(removeUndefined(nativeVersion));
});

const removeUndefined = (data: unknown) => {
  return JSON.parse(JSON.stringify(data));
};
