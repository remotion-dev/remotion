import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { expect, test } from "vitest";

test("Set the right version for gotest", () => {
  const referenceVersion = readFileSync(
    path.join(process.cwd(), "..", "core", "package.json"),
    "utf-8"
  );

  const referenceVersionJson = JSON.parse(referenceVersion);
  const version = referenceVersionJson.version;
  expect(typeof version).toBe("string");

  const VERSION = `const VERSION = "${version}"`;
  writeFileSync(
    path.join(process.cwd(), "..", "goclient", "version.go"),
    VERSION
  );
});
