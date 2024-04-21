import {build} from 'bun';

const mainModule = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	external: [
		'react',
		'remotion',
		'remotion/no-react',
		'react/jsx-runtime',
		'@shopify/react-native-skia',
	],
});

const [file] = mainModule.outputs;
const text = await file.text();

await Bun.write('dist/esm/index.mjs', text);

const skiaModule = await build({
	entrypoints: ['src/enable.ts'],
	naming: '[name].mjs',
	target: 'node',
	external: ['@remotion/bundler', 'canvaskit-wasm/bin/full/canvaskit.wasm'],
});

const [enableFile] = skiaModule.outputs;
const skiaEnable = await enableFile.text();

await Bun.write('dist/esm/enable.mjs', skiaEnable);

export {};
