import { $ } from "bun";
import { renameSync, unlinkSync } from "fs";

const folder = "lasvegas";

const ls = (await $`ls public/${folder}`).stdout.toString("utf-8");
const files = ls.split("\n");

for (const file of files) {
  if (
    file.toLowerCase().endsWith(".mov") ||
    file.toLowerCase().endsWith(".mp4")
  ) {
    await $`ffmpeg -i public/${folder}/${file} public/${folder}/_${file}.mp4`;
    unlinkSync(`public/${folder}/${file}`);
    renameSync(
      `public/${folder}/_${file}.mp4`,
      `public/${folder}/${file.split(".")[0]}.mp4`,
    );
  }
}
