import path from "path";
import execa from "execa";
import { expect, test } from "bun:test";

test("Should be able to call pnpm exec compositions", async () => {
  const task = await execa(
    "pnpm",
    ["exec", "remotion", "compositions", "src/index.ts"],
    {
      cwd: path.join(process.cwd(), "..", "example"),
    }
  );

  expect(task.stdout).toContain("The following compositions");
});
