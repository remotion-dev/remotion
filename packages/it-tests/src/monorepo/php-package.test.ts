import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { expect, test } from "vitest";
import { LambdaInternals } from "@remotion/lambda";

test("Set the right version for phpunit", () => {
  const referenceVersion = readFileSync(
    path.join(process.cwd(), "..", "core", "package.json"),
    "utf-8"
  );

  const referenceVersionJson = JSON.parse(referenceVersion);
  const version = referenceVersionJson.version;
  expect(typeof version).toBe("string");

  const VERSION = `<?php \nnamespace Remotion\\LambdaPhp;\n\nconst VERSION = "${version}";`;
  writeFileSync(
    path.join(process.cwd(), "..", "lambda-php", "src", "Version.php"),
    VERSION
  );
});

test("PHP package should create the same payload as normal Lambda package", async () => {
  const phpOutput = execSync("phpunit ./src/PHPClientTest.php", {
    cwd: path.join(process.cwd(), "..", "lambda-php"),
  });
  console.log("show php output");
  console.log(phpOutput.toString());
  const firstLine = phpOutput.toString().split("\n")[4];

  const nativeVersion = await LambdaInternals.makeLambdaPayload({
    region: "us-east-1",
    composition: "react-svg",
    functionName: "remotion-render",
    serveUrl: "testbed",
    codec: "h264",
  });

  const raw = firstLine.substring(0, firstLine.lastIndexOf("}") + 1);
  console.log("show php output raw");
  console.log(raw);
  const parsedJson = JSON.parse(raw);

  expect(JSON.stringify(parsedJson, null, 3)).toEqual(
    JSON.stringify(nativeVersion, null, 3)
  );
});
