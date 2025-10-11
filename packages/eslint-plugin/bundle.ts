import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'build',
		esm: 'build',
	},
	external: ['@typescript-eslint/utils'],
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'node',
		},
	],
});
