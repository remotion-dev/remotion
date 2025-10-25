import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'build',
		esm: 'build',
	},
	external: 'dependencies',
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'node',
		},
		{
			path: 'src/constants.ts',
			target: 'browser',
		},
		{path: 'src/regions.ts', target: 'browser'},
	],
});
