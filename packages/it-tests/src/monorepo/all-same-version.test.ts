import { existsSync, lstatSync, readdirSync, readFileSync } from "fs";
import path from "path";
import { expect, test } from "vitest";

test("All packages require the same remotion version", () => {
  const packages = readdirSync(path.join(process.cwd(), ".."));
  const folders = packages.filter((p) =>
    lstatSync(path.join(process.cwd(), "..", p)).isDirectory()
  );

  let deps = 0;
  for (const folder of folders) {
    const packageJsonPath = path.join(
      process.cwd(),
      "..",
      folder,
      "package.json"
    );
    if (!existsSync(packageJsonPath)) {
      continue;
    }

    const json = readFileSync(packageJsonPath, "utf-8");

    const packageJson = JSON.parse(json);
    const {
      dependencies,
      devDependencies,
      peerDependencies,
      optionalDependencies,
    } = packageJson;

    const allDeps = {
      ...dependencies,
      ...devDependencies,
      ...peerDependencies,
      ...optionalDependencies,
    };

    const onlyRemotionDeps = Object.keys(allDeps).filter(
      (dep) => dep.startsWith("@remotion") || dep === "remotion"
    );

    for (const dep of onlyRemotionDeps) {
      expect(allDeps[dep]).toBe("workspace:*");
      deps++;
    }
  }
  expect(deps).toBeGreaterThan(75);
});

test("All packages require the same remotion version", () => {
  const packages = readdirSync(path.join(process.cwd(), ".."));
  const folders = packages.filter((p) =>
    lstatSync(path.join(process.cwd(), "..", p)).isDirectory()
  );

  const versions = new Set<string>();

  for (const folder of folders) {
    const packageJsonPath = path.join(
      process.cwd(),
      "..",
      folder,
      "package.json"
    );
    if (!existsSync(packageJsonPath)) {
      continue;
    }

    const json = readFileSync(packageJsonPath, "utf-8");

    const packageJson = JSON.parse(json);
    versions.add(packageJson.version);
  }
  if (versions.size > 1) {
    console.log("Versions", versions);
  }
  expect(versions.size).toBe(1);
});
