// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				file: 'dist/esm/index.mjs',
				format: 'es',
				sourcemap: false,
			},
		],
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
		plugins: [
			typescript({
				tsconfig: 'tsconfig-esm.json',
				sourceMap: false,
				outputToFilesystem: true,
			}),
		],
	},
];
