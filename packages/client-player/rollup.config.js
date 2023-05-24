// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import banner from 'rollup-plugin-banner';
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
		external: ['react', 'remotion', 'react/jsx-runtime'],
		plugins: [
			typescript({
				tsconfig: 'tsconfig-esm.json',
				sourceMap: false,
				outputToFilesystem: true,
			}),
			banner(`'use client'; \n`),
		],
	},
];
