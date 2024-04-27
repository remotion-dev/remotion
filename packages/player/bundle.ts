import {build} from 'bun';

const output = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	target: 'node',
	external: ['remotion', 'remotion/no-react', 'react'],
});

const [file] = output.outputs;
const text = (await file.text())
	.replace(/jsxDEV/g, 'jsx')
	.replace(/react\/jsx-dev-runtime/g, 'react/jsx-runtime');

await Bun.write('dist/esm/index.mjs', `"use client";\n${text}`);

export {};
