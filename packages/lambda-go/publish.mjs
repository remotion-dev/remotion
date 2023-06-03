import { VERSION } from "remotion/version";
import { execSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  cpSync,
  existsSync,
  rmSync,
  writeFileSync,
  readdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const tmpDir = tmpdir();

const workingDir = path.join(tmpDir, "lambda-go-sdk");
if (existsSync(workingDir)) {
  rmSync(workingDir, { recursive: true });
}
mkdirSync(workingDir);
console.log(tmpDir);

execSync(
  `git clone git@github.com:remotion-dev/lambda-go-sdk.git ${workingDir}`,
  {
    cwd: tmpDir,
  }
);

const dir = readdirSync(".");
for (const file of dir) {
  if (file.endsWith(".go") && !file.endsWith("_test.go")) {
    copyFileSync(file, path.join(workingDir, file));
  }
}

copyFileSync("go.mod", path.join(workingDir, "go.mod"));
copyFileSync("go.sum", path.join(workingDir, "go.sum"));

writeFileSync(
  path.join(workingDir, "README.md"),
  [
    "# Remotion Lambda Go SDK",
    "This repository exists because the Go SDK must be in a separate repository.",
    "The actual source code is located in the [Remotion repository](https://remotion.dev/github).",
    "This repository is automatically updated when a new version of Remotion is released.",
    "Do not open issues or pull requests here.",
    "",
    "## Installation",
    "Visit https://www.remotion.dev/docs/lambda/go to learn how to install the Remotion Lambda Go SDK.",
  ].join("\n")
);
execSync("git add .", { cwd: workingDir });
execSync(`git commit -m 'Release ${VERSION}'`, { cwd: workingDir });
execSync(`git tag ${VERSION}`, { cwd: workingDir });
execSync("git push", { cwd: workingDir });
execSync(`git push origin ${VERSION}`, { cwd: workingDir });
execSync("git push --tags", { cwd: workingDir });
