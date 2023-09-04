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

test("Set the right version for phpunit", () => {
  expect(typeof version).toBe("string");

  const VERSION = `<?php \nnamespace Remotion\\LambdaPhp;\n\nconst VERSION = "${version}";`;
  writeFileSync(
    path.join(process.cwd(), "..", "lambda-php", "src", "Version.php"),
    VERSION
  );
});

test("Set the right version for composer.json", () => {
  const composerJson = readFileSync(
    path.join(process.cwd(), "..", "lambda-php", "composer.json"),
    "utf-8"
  );
  const composerJsonJson = JSON.parse(composerJson);
  composerJsonJson.version = version;
  writeFileSync(
    path.join(process.cwd(), "..", "lambda-php", "composer.json"),
    JSON.stringify(composerJsonJson, null, 2) + "\n"
  );
});

test("Set the right verison for composer.json in example", () => {
  const composerJson = readFileSync(
    path.join(process.cwd(), "..", "lambda-php-example", "composer.json"),
    "utf-8"
  );
  const composerJsonJson = JSON.parse(composerJson);
  composerJsonJson.require["remotion/lambda"] = version;
  writeFileSync(
    path.join(process.cwd(), "..", "lambda-php-example", "composer.json"),
    JSON.stringify(composerJsonJson, null, 2) + "\n"
  );
});

test("PHP package should create the same renderMedia payload as normal Lambda package", async () => {
  execSync("php composer.phar install", {
    cwd: path.join(process.cwd(), "..", "lambda-php"),
  });
  const phpOutput = execSync("phpunit ./src/PHPClientTest.php", {
    cwd: path.join(process.cwd(), "..", "lambda-php"),
  });
  const output = phpOutput.toString().split("\n");
  const toParse = output[4];
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
  const jsonOutput = toParse.substring(0, toParse.lastIndexOf("}") + 1);
  const parsedJson = JSON.parse(jsonOutput);

  expect(
    removeUndefined({
      ...parsedJson,
      type: "start",
    })
  ).toEqual(removeUndefined(nativeVersion));
});

test("PHP package should create the same progress payload as normal Lambda package", async () => {
  execSync("php composer.phar install", {
    cwd: path.join(process.cwd(), "..", "lambda-php"),
  });
  const phpOutput = execSync("phpunit ./src/PHPRenderProgressTest.php", {
    cwd: path.join(process.cwd(), "..", "lambda-php"),
  });
  const output = phpOutput.toString().split("\n");
  const toParse = output[4];
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
