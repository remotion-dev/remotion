import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'use-tsc',
		esm: 'build',
	},
	external: 'dependencies',
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'node',
		},
		{
			path: 'src/client.ts',
			target: 'node',
		},
		{
			path: 'src/pure.ts',
			target: 'browser',
		},
		{
			path: 'src/error-handling.ts',
			target: 'node',
		},
	],
});
