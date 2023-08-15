import path from "path";
import fs from "fs";
import { beforeEach, expect, test } from "vitest";
import execa from "execa";

const outputPath = path.join(process.cwd(), "packages/example/out.mp4");

beforeEach(() => {
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
});

test("Should fail to render if cancelRender() was being used", async () => {
  const task = await execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "render",
      "cancel-render",
      "--frames=2-10",
      outputPath,
    ],
    {
      cwd: path.join(process.cwd(), "..", "example"),
      reject: false,
    }
  );

  expect(task.exitCode).toBe(1);
  expect(task.stderr).toContain("CancelledError");
  expect(task.stderr).toContain("This should be the error message");

  // Should symbolicate stacktrace
  // Do not search for strings that depend on color support
  expect(task.stdout).toContain("src/CancelRender/index.tsx:18");
  expect(task.stdout).toContain(
    "Worst case: Inside a promise without a catch handler"
  );
  expect(task.stdout).toContain("and with a timeout running");
  expect(task.stdout).toContain(
    "cancelRender(new Error('This should be the error message'));"
  );
});
