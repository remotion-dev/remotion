// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default [
	{
		input: 'src/no-react.ts',
		output: [
			{
				file: 'dist/esm/no-react.mjs',
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
