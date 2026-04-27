import path from 'path';
import type {BunPlugin} from 'bun';
import {buildPackage} from '../.monorepo/builder';

const resolveWorkspaceSourcesPlugin: BunPlugin = {
	name: 'resolve-workspace-sources',
	setup(build) {
		const mappings: Record<string, string> = {
			'@remotion/renderer/error-handling': path.resolve(
				'../renderer/src/error-handling.ts',
			),
			'@remotion/renderer/pure': path.resolve('../renderer/src/pure.ts'),
			'@remotion/renderer/client': path.resolve('../renderer/src/client.ts'),
			'@remotion/streaming': path.resolve('../streaming/src/index.ts'),
			'remotion/no-react': path.resolve('../core/src/no-react.ts'),
			'remotion/version': path.resolve('../core/src/version.ts'),
		};

		build.onResolve({filter: /^(@remotion\/|remotion\/)/}, (args) => {
			const resolved = mappings[args.path];
			if (resolved) {
				return {path: resolved};
			}

			return undefined;
		});
	},
};

await buildPackage({
	formats: {
		cjs: 'use-tsc',
		esm: 'build',
	},
	external: [],
	plugins: [resolveWorkspaceSourcesPlugin],
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'node',
		},
	],
});
