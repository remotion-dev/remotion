import path from "path";
import fs from "fs";
import execa from "execa";

test("Should be able to render if remotion.config.ts is not provided", async () => {
  const outputPath = path.join(process.cwd(), "packages/example/out.mp3");

  const task = await execa(
    "pnpx",
    ["remotion", "render", "src/index.tsx", "many-audio", outputPath],
    {
      cwd: path.join(process.cwd(), "..", "example"),
    }
  );

  expect(task.exitCode).toBe(0);
  fs.unlinkSync(outputPath);
});
