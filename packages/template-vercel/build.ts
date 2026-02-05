import { $ } from "bun";

await $`bunx remotion bundle --out-dir ./.remotion`;
await $`bunx next build`;
