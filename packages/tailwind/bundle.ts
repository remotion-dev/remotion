import {build} from 'bun';

const output = await build({
	entrypoints: ['src/enable.ts'],
	naming: '[name].mjs',
	target: 'node',
	external: ['*'],
});

const [file] = output.outputs;
const text = await file.text();

await Bun.write('dist/esm/index.mjs', text);

export {};
