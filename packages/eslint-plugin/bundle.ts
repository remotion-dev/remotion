import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: ['cjs', 'esm'],
	external: ['@typescript-eslint/utils'],
	target: 'node',
	entrypoints: ['src/index.ts'],
});
