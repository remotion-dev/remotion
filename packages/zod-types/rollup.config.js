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
		external: ['remotion', 'zod', 'remotion/no-react'],
		plugins: [
			typescript({
				tsconfig: 'tsconfig-esm.json',
				sourceMap: false,
				outputToFilesystem: true,
			}),
		],
	},
];
