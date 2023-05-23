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

  const output = phpOutput.toString().split("\n");

  console.log("first Line");
  console.log(output[0]);
  console.log("second Line");
  console.log(output[1]);
  console.log("third Line");
  console.log(output[2]);
  console.log("fourth Line");
  console.log(output[3]);
  console.log("Fifth Line");
  console.log(output[4]);

  console.log("whole output");
  console.log(output);

  const toParse = output[4];

  const nativeVersion = await LambdaInternals.makeLambdaPayload({
    region: "us-east-1",
    composition: "react-svg",
    functionName: "remotion-render",
    serveUrl: "testbed",
    codec: "h264",
  });

  //const startMarker = "(100%)";
  const jsonOutput = toParse.substring(0, toParse.lastIndexOf("}") + 1);
  console.log("The element to parse");
  console.log(jsonOutput);
  const parsedJson = JSON.parse(jsonOutput);

  expect(JSON.stringify(parsedJson, null, 3)).toEqual(
    JSON.stringify(nativeVersion, null, 3)
  );
});
