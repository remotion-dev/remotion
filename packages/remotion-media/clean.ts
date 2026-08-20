import {$} from 'bun';

await $`rm -rf files`;
await $`rm -rf out`;
await $`rm -rf dist`;
await $`rm -f tone.wav`;
await $`rm -f tone-loop.wav`;
