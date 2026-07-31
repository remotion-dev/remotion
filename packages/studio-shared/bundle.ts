import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		esm: 'build',
		cjs: 'use-tsc',
	},
	external: 'dependencies',
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'browser',
		},
		{
			path: 'src/studio-entry-points.ts',
			target: 'browser',
		},
		{
			path: 'src/studio-html.ts',
			target: 'browser',
		},
		{
			path: 'src/keyframe-easing-presets.ts',
			target: 'browser',
		},
		{
			path: 'src/keyframe-interpolation-function.ts',
			target: 'browser',
		},
		{
			path: 'src/parse-spring-easing-config.ts',
			target: 'browser',
		},
	],
});
