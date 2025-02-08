import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'use-tsc',
		esm: 'build',
	},
	external: [],
	target: 'node',
	entrypoints: ['src/index.ts'],
});
