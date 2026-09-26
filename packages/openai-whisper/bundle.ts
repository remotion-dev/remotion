import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {esm: 'build', cjs: 'use-tsc'},
	external: 'dependencies',
	entrypoints: [{path: 'src/index.ts', target: 'browser'}],
});
