import { $ } from "bun";
import { BUILD_DIR } from "./build-dir.mjs";

await $`bunx remotion bundle --out-dir ./${BUILD_DIR}`;
