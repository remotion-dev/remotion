import {$} from 'bun';

await $`rm -rf files`;
await $`rm -rf out`;
await $`rm -rf dist`;
