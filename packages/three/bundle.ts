import {build} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const output = await build({
	entrypoints: ['src/index.ts', 'src/webgpu.tsx'],
	naming: '[name].mjs',
	external: [
		'react',
		'remotion',
		'@remotion/media-utils',
		'remotion/no-react',
		'react/jsx-runtime',
		'@react-three/fiber',
		'three/webgpu',
		'three/src/textures/VideoTexture.js',
		'three/src/loaders/TextureLoader.js',
	],
});

for (const file of output.outputs) {
	await Bun.write(`dist/esm/${file.path.split('/').pop()}`, await file.text());
}

export {};
