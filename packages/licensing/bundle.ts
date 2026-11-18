import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'use-compiler-output',
		esm: 'build',
	},
	external: 'dependencies',
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'node',
		},
	],
});
