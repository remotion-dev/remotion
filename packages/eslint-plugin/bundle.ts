import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'build',
		esm: 'build',
	},
	external: ['@typescript-eslint/utils'],
	target: 'node',
	entrypoints: ['src/index.ts'],
});
