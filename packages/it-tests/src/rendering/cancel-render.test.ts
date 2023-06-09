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

  console.log(task.stdout);
  // Should symbolicate stacktrace
  expect(task.stdout).toContain("at src/CancelRender/index.tsx:18");
  expect(task.stdout).toContain(
    "16 │ \t// Worst case: Inside a promise without a catch handler\n"
  );
  expect(task.stdout).toContain("17 │ \t// and with a timeout running\n");
  expect(task.stdout).toContain(
    "18 │ \tcancelRender(new Error('This should be the error message'));\n"
  );
});
