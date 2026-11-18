import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {esm: 'build', cjs: 'use-compiler-output'},
	external: 'dependencies',
	entrypoints: [{path: 'src/index.ts', target: 'browser'}],
});
