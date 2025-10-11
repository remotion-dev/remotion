import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'use-tsc',
		esm: 'build',
	},
	external: [],
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'node',
		},
	],
});
