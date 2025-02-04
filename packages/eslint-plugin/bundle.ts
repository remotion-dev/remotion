import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: ['cjs', 'esm'],
	external: [],
	target: 'node',
	entrypoints: ['src/index.ts'],
});
