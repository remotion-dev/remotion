import { execSync } from "child_process";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "fs";
import path from "path";

let version = process.argv[2];
if (!version) {
  throw new Error("Please specify a version");
}

if (version.startsWith("v")) {
  version = version.slice(1);
}

const dirs = readdirSync("packages")
  .filter((dir) =>
    lstatSync(path.join(process.cwd(), "packages", dir)).isDirectory()
  )
  .filter((dir) =>
    existsSync(path.join(process.cwd(), "packages", dir, "package.json"))
  );

for (const dir of dirs) {
  const packageJsonPath = path.join(
    process.cwd(),
    "packages",
    dir,
    "package.json"
  );
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  packageJson.version = version;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
  try {
    execSync("pnpm exec prettier --write package.json", {
      cwd: path.join(process.cwd(), "packages", dir),
    });
  } catch (e) {
    // console.log(e.message);
  }
}
console.log(dirs);

execSync("node ensure-correct-version.js", {
  cwd: "packages/core",
});

execSync("pnpm exec vitest src/monorepo --run", {
  cwd: "packages/it-tests",
  stdio: "inherit",
});
