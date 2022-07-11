import path from "path";
import execa from "execa";

test("Should be able to call pnpm exec compositions", async () => {
  const task = await execa(
    "pnpm",
    ["exec", "remotion", "compositions", "src/index.tsx"],
    {
      cwd: path.join(process.cwd(), "..", "example"),
    }
  );

  expect(task.stdout).toContain("The following compositions");
});
