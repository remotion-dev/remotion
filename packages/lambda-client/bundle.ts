import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: ['cjs', 'esm'],
	external: 'dependencies',
	target: 'node',
	entrypoints: ['src/index.ts', 'src/constants.ts', 'src/regions.ts'],
});
