import execa from "execa";
import path from "path";
import { expect, test } from "vitest";

test("Should be able to call bunx remotion lambda", async () => {
  const task = await execa("bunx", ["remotion", "lambda"], {
    cwd: path.join(process.cwd(), "..", "example"),
  });
  expect(task.stdout).toContain("Available commands");
});

test("Should be able to get user policy without authentication", async () => {
  const task = await execa(
    "bunx",
    ["remotion", "lambda", "policies", "user"],
    {
      cwd: path.join(process.cwd(), "..", "example"),
    }
  );
  expect(task.stdout).toContain("iam:SimulatePrincipalPolicy");
});

test("Should be able to get role policy without authentication", async () => {
  const task = await execa(
    "bunx",
    ["remotion", "lambda", "policies", "role"],
    {
      cwd: path.join(process.cwd(), "..", "example"),
    }
  );
  expect(task.stdout).toContain("s3:ListAllMyBuckets");
});
