import {build} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const output = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
});

const [file] = output.outputs;
const text = await file.text();

await Bun.write('dist/esm/index.mjs', text);

const basicCaptions = await build({
	entrypoints: ['src/basic-captions.tsx'],
	naming: '[name].mjs',
	external: ['react', 'react/jsx-runtime', 'remotion'],
});
await Bun.write(
	'dist/esm/basic-captions.mjs',
	await basicCaptions.outputs[0].text(),
);

export {};
