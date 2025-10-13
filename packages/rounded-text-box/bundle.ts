import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'build',
		esm: 'build',
	},
	external: ['@remotion/layout-utils', '@remotion/paths'],
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'node',
		},
	],
});
