import path from "path";
import execa from "execa";
import { expect, test } from "vitest";
import { spawn } from "child_process";
import { RenderInternals, openBrowser } from "@remotion/renderer";

test("Bundle studio", async () => {
  await execa("pnpm", ["exec", "remotion", "bundle"], {
    cwd: path.join(process.cwd(), "..", "example"),
  });
  const port = RenderInternals.getDesiredPort({
    desiredPort: undefined,
    from: 3000,
    to: 3100,
    hostsToTry: ["::", "::1"],
  });
  const server = spawn(
    "pnpm",
    ["exec", "serve", "-l", `${(await port).port}`, "build"],
    {
      cwd: path.join(process.cwd(), "..", "example"),
    }
  );

  const browser = openBrowser("chrome");
  const tab = await (await browser).newPage(() => null, "info", false);
  await tab.goto({
    url: `http://localhost:${(await port).port}`,
    timeout: 10000,
    options: {},
  });
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 3000);
  });
  const result = await tab.evaluateHandle(() => {
    return document.querySelectorAll(".css-reset").length;
  });
  expect(result.toString()).toBeGreaterThan(1);

  server.kill();
  await (await browser).close(false, "info", false);
});
