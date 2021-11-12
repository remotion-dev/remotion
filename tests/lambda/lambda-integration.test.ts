import execa from "execa";

test("Should be able to call npx remotion lambda", async () => {
  const task = await execa("npx", ["remotion", "lambda"], {
    cwd: "packages/example",
  });
  expect(task.stdout).toContain("Available commands");
});

test("Should be able to get user policy without authentication", async () => {
  const task = await execa("npx", ["remotion", "lambda", "policies", "user"], {
    cwd: "packages/example",
  });
  expect(task.stdout).toContain("Available commands");
});
