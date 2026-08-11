import { $ } from "bun";
import { cpSync, existsSync, rmdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const tmp = path.join(tmpdir(), "recorder");

if ((await $`git status --porcelain`.quiet()).exitCode !== 0) {
  console.error(
    "Your Git status is dirty. Please commit or stash your changes before running this script.",
  );
  process.exit(1);
}

await $`git clone https://github.com/remotion-dev/recorder.git ${tmp} --depth=1`.env(
  {
    GIT_LFS_SKIP_SMUDGE: "1",
  },
);

const getFilesInGit = async (folder: string) => {
  return (await $`git ls-files`.quiet().cwd(folder)).stdout
    .toString("utf-8")
    .split("\n")
    .filter(Boolean)
    .filter((file) => {
      if (file.startsWith("public")) {
        return false;
      }

      if (file === ".gitattributes") {
        return false;
      }

      if (file.startsWith("config")) {
        const knownConfigs = [
          "endcard.ts",
          "fonts.ts",
          "fps.ts",
          "layout.ts",
          "scenes.ts",
          "server.ts",
          "sounds.ts",
          "themes.ts",
          "transitions.ts",
          "autocorrect.ts",
          "whisper.ts",
          "cameras.ts",
        ];

        // Don't override config files with defaults
        if (knownConfigs.some((f) => file.endsWith(f))) {
          return false;
        }

        return true;
      }

      if (file.endsWith("Root.tsx")) {
        return false;
      }

      return true;
    });
};

const filesInUpstream = await getFilesInGit(tmp);
const filesInCurrent = await getFilesInGit(process.cwd());

const filesNotInUpstream = filesInCurrent.filter(
  (file) => !filesInUpstream.includes(file),
);

for (const file of filesInUpstream) {
  const fullPath = path.join(tmp, file);
  cpSync(fullPath, path.join(process.cwd(), file));
}

for (const file of filesNotInUpstream) {
  const fullPath = path.join(process.cwd(), file);
  if (existsSync(fullPath)) {
    rmSync(fullPath);
  }
}

rmdirSync(tmp, { recursive: true });

await $`git status`;

console.log(
  "Pulled files from the current main branch of the Recorder (except public, config and Root.tsx)",
);
console.log("Please review the changes and commit them.");
