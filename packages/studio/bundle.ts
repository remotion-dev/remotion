import {buildPackage} from '../.monorepo/builder';

const external = [
	'react',
	'remotion',
	'react-dom',
	'react',
	'@remotion/media-utils',
	'@remotion/studio-shared',
	'@remotion/zod-types',
	'@remotion/renderer',
	'@remotion/player',
	'@remotion/renderer/client',
	'@remotion/renderer/pure',
	'@remotion/renderer/error-handling',
	'source-map',
	'zod',
	'remotion/no-react',
	'react/jsx-runtime',
];

await buildPackage({
	formats: {
		esm: 'build',
		cjs: 'use-tsc',
	},
	external,
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'browser',
		},
		{
			path: 'src/renderEntry.tsx',
			target: 'browser',
			splitting: true,
		},
		{
			path: 'src/internals.ts',
			target: 'browser',
		},
		{
			path: 'src/previewEntry.tsx',
			target: 'browser',
		},
	],
});
