import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'use-tsc',
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
