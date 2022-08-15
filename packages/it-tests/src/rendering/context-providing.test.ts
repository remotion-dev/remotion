import fs from "fs";
import execa from "execa";
import path from "path";
import { afterEach, beforeEach, test, expect } from "vitest";

const outputPath = path.join(process.cwd(), "packages/example/out.png");

beforeEach(() => {
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
});

afterEach(() => {
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
});

test("Should be able to render video that was wrapped in context", async () => {
  await execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "still",
      "src/index.tsx",
      "wrapped-in-context",
      outputPath,
    ],
    {
      cwd: path.join(process.cwd(), "..", "example"),
    }
  );

  const exists = fs.existsSync(outputPath);
  expect(exists).toBe(true);
});
