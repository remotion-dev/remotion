import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		esm: 'build',
		cjs: 'use-tsc',
	},
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'browser',
		},
		{
			path: 'src/node.ts',
			target: 'node',
		},
		{
			path: 'src/web.ts',
			target: 'browser',
		},
		{
			path: 'src/universal.ts',
			target: 'node',
		},
		{
			path: 'src/node-writer.ts',
			target: 'node',
		},
		{
			path: 'src/worker-web-entry.ts',
			target: 'browser',
		},
		{
			path: 'src/worker-server-entry.ts',
			target: 'node',
		},
		{
			path: 'src/worker.module.ts',
			target: 'browser',
		},
		{
			path: 'src/server-worker.module.ts',
			target: 'node',
		},
	],
	external: ['stream'],
});
