// rollup.config.js
import typescript from '@rollup/plugin-typescript';

const presentations = ['slide', 'flip', 'wipe', 'fade', 'clock-wipe'];

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
		external: ['remotion', 'remotion/no-react', 'react', 'react/jsx-runtime'],
		plugins: [
			typescript({
				tsconfig: 'tsconfig.json',
				sourceMap: false,
				outputToFilesystem: true,
			}),
		],
	},
	...presentations.map((p) => {
		return {
			input: `src/presentations/${p}.tsx`,
			output: [
				{
					file: `dist/esm/${p}.mjs`,
					format: 'es',
					sourcemap: false,
				},
			],
			external: [
				'remotion',
				'remotion/no-react',
				'react',
				'react/jsx-runtime',
				'@remotion/paths',
				'@remotion/shapes',
			],
			plugins: [
				typescript({
					tsconfig: 'tsconfig.json',
					sourceMap: false,
					outputToFilesystem: true,
				}),
			],
		};
	}),
];
