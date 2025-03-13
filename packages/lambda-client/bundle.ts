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
			path: 'src/constants.ts',
			target: 'browser',
		},
		{path: 'src/regions.ts', target: 'browser'},
	],
	filterExternal: (external) => {
		return external.filter((e) => e !== '@aws-sdk/credential-provider-ini');
	},
});
