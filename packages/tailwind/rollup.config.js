// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import banner2 from 'rollup-plugin-banner2';

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
		external: [],
		plugins: [
			typescript({
				tsconfig: 'tsconfig-esm.json',
				sourceMap: false,
				outputToFilesystem: true,
			}),
			banner2(
				() =>
					`import {createRequire} from "module";\nconst require = createRequire(import.meta.url);\n\n`
			),
		],
	},
];
