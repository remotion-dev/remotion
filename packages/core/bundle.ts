import {build} from 'bun';

const output = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	target: 'node',
	external: ['remotion', 'remotion/no-react', 'react', 'react-dom'],
});

const [file] = output.outputs;
const text = (await file.text())
	.replace(/jsxDEV/g, 'jsx')
	.replace(/react\/jsx-dev-runtime/g, 'react/jsx-runtime');

await Bun.write('dist/esm/index.mjs', text);

const versionOutput = await build({
	entrypoints: ['src/version.ts'],
	naming: '[name].mjs',
	target: 'node',
});

const [versionFile] = versionOutput.outputs;
await Bun.write('dist/esm/version.mjs', await versionFile.text());

const noReactOutput = await build({
	entrypoints: ['src/no-react.ts'],
	naming: '[name].mjs',
	target: 'node',
	external: ['remotion', 'react', 'react-dom'],
});
const [noReactFile] = noReactOutput.outputs;
await Bun.write('dist/esm/no-react.mjs', await noReactFile.text());

export {};
