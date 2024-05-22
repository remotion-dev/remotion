import { bugs } from "./api/[v]";
import { $ } from "bun";

const buggyRelease: string[] = [];

for (const bug of bugs) {
  buggyRelease.push(...bug.versions);
}

const uniqueVersions = [...new Set(buggyRelease)];
console.log(uniqueVersions);

for (const version of uniqueVersions) {
  await $`npm deprecate remotion@${version} "This version contains bugs: https://bugs.remotion.dev/${version}"`;
  console.log(`Deprecated version ${version}`);
}
