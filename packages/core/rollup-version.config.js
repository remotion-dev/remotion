// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default [
	{
		input: 'src/version.ts',
		output: [
			{
				file: 'dist/esm/version.mjs',
				format: 'es',
				sourcemap: false,
			},
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
