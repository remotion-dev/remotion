import CopyPlugin from 'copy-webpack-plugin';
import type {WebpackOverrideFn} from 'remotion';

export const enableSkia: WebpackOverrideFn = (currentConfiguration) => {
	return {
		...currentConfiguration,
		plugins: [
			...(currentConfiguration.plugins ?? []),
			new CopyPlugin({
				patterns: [
					{from: 'node_modules/canvaskit-wasm/bin/full/canvaskit.wasm'},
				],
			}),
		],
		resolve: {
			...currentConfiguration.resolve,
			// FIXME: To fix missing modules in browser when using webassembly
			fallback: {
				fs: false,
				path: false,
			},
			extensions: [
				'.web.js',
				'.web.ts',
				'.web.tsx',
				'.js',
				'.ts',
				'.tsx',
				'...',
			],
		},
		externals: {
			...((currentConfiguration.externals as Record<string, string>) ?? {}),
			'react-native-reanimated': "require('react-native-reanimated')",
			'react-native-reanimated/lib/reanimated2/core':
				"require('react-native-reanimated/lib/reanimated2/core')",
		},
	};
};
