// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default [
	{
		input: 'src/enable.ts',
		output: [
			{
				file: 'dist/esm/enable.mjs',
				format: 'es',
				sourcemap: false,
			},
		],
		external: ['react'],
		plugins: [
			typescript({
				tsconfig: 'tsconfig-esm.json',
				sourceMap: false,
				outputToFilesystem: true,
			}),
		],
	},
];
