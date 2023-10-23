// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				file: 'dist/cjs/index.js',
				format: 'cjs',
				sourcemap: false,
			},
		],
		external: ['remotion', 'react', 'react/jsx-runtime'],
		plugins: [
			typescript({
				tsconfig: 'tsconfig-cjs.json',
				sourceMap: false,
				outputToFilesystem: true,
			}),
		],
	},
	{
		input: 'src/presentations/slide.tsx',
		output: [
			{
				file: 'dist/cjs/slide.js',
				format: 'cjs',
				sourcemap: false,
			},
		],
		external: ['remotion', 'react', 'react/jsx-runtime'],
		plugins: [
			typescript({
				tsconfig: 'tsconfig-cjs.json',
				sourceMap: false,
				outputToFilesystem: true,
			}),
		],
	},
	{
		input: 'src/presentations/fade.tsx',
		output: [
			{
				file: 'dist/cjs/fade.js',
				format: 'cjs',
				sourcemap: false,
			},
		],
		external: ['remotion', 'react', 'react/jsx-runtime'],
		plugins: [
			typescript({
				tsconfig: 'tsconfig-cjs.json',
				sourceMap: false,
				outputToFilesystem: true,
			}),
		],
	},
  {
		input: 'src/presentations/wipe.tsx',
		output: [
			{
				file: 'dist/cjs/wipe.js',
				format: 'cjs',
				sourcemap: false,
			},
		],
		external: ['remotion', 'react', 'react/jsx-runtime'],
		plugins: [
			typescript({
				tsconfig: 'tsconfig-cjs.json',
				sourceMap: false,
				outputToFilesystem: true,
			}),
		],
	},
];
