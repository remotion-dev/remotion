import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'do-nothing',
		esm: 'build',
	},
	external: ['remotion'],
	entrypoints: [{path: 'src/index.tsx', target: 'browser'}],
});
