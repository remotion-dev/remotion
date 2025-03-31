import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'use-tsc',
		esm: 'build',
	},
	external: ['./main.js'],
	entrypoints: [
		{
			path: 'src/index.module.ts',
			target: 'browser',
		},
	],
});
