import {build} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}
console.time('Generated.');
const output = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	external: ['@remotion/media-parser'],
});

const [file] = output.outputs;
const text = await file.text();

await Bun.write('dist/esm/index.mjs', text);

export {};
console.timeEnd('Generated.');
