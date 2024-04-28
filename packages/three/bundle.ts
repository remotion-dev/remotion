import {build} from 'bun';

const output = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	external: [
		'react',
		'remotion',
		'@remotion/media-utils',
		'remotion/no-react',
		'react/jsx-runtime',
		'@react-three/fiber',
		'three/src/textures/VideoTexture.js',
		'three/src/loaders/TextureLoader.js',
	],
});

const [file] = output.outputs;
const text = (await file.text())
	.replace(/jsxDEV/g, 'jsx')
	.replace(/react\/jsx-dev-runtime/g, 'react/jsx-runtime');

await Bun.write('dist/esm/index.mjs', text);

export {};
