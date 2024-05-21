import path from "path";
import execa from "execa";
import { expect, test } from "vitest";

test("Should be able to call bunx compositions", async () => {
  const task = await execa(
    "bunx",
    ["remotion", "compositions", "src/index.ts"],
    {
      cwd: path.join(process.cwd(), "..", "example"),
    }
  );

  expect(task.stdout).toContain("The following compositions");
});
