import {build} from 'bun';

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
const text = (await file.text())
	.replace(/jsxDEV/g, 'jsx')
	.replace(/react\/jsx-dev-runtime/g, 'react/jsx-runtime');

await Bun.write('dist/esm/index.mjs', text);

export {};
