import fs from "fs";
import path from "path";
import { expect, test } from "vitest";

test("Should not have carets in Remotion versions", async () => {
  const packagesDir = path.join(process.cwd(), "..");
  const packages = await fs.promises.readdir(packagesDir);
  for (const pkg of packages) {
    const stat = fs.statSync(path.join(packagesDir, pkg));
    if (!stat.isDirectory()) {
      continue;
    }

    const packageJson = fs.readFileSync(
      path.join(packagesDir, pkg, "package.json"),
      "utf-8"
    );
    const json = JSON.parse(packageJson);
    if (!json.dependencies) {
      continue;
    }
    const remotionDeps = Object.keys(json.dependencies).filter(
      (j) => j === "remotion" || j.startsWith("@remotion")
    );
    for (const dep of remotionDeps) {
      const val = json.dependencies[dep];
      if (val.includes("^")) {
        throw new Error(`package ${pkg} has dep ${dep} version ${val}`);
      }
    }
  }
  expect(1).toBe(1);
});
