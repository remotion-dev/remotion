import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	entrypoints: [{path: 'src/index.ts', target: 'node'}],
	formats: {
		cjs: 'use-tsc',
		esm: 'build',
	},
	external: ['eslint', 'typescript-eslint'],
});
