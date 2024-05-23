import {build} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const output = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	external: [
		'react/jsx-runtime',
		'@rive-app/canvas-advanced',
		'react',
		'remotion',
		'remotion/no-react',
	],
});

const [file] = output.outputs;
const text = await file.text();

await Bun.write('dist/esm/index.mjs', text);

export {};
