import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'use-compiler-output',
		esm: 'build',
	},
	external: ['./main.js', './worker.js'],
	entrypoints: [
		{
			path: 'src/index.module.ts',
			target: 'browser',
		},
	],
});
