import type {WebpackOverrideFn} from '@remotion/bundler';
import CopyPlugin from 'copy-webpack-plugin';

/**
 * @description A function that modifies the default Webpack configuration to make the necessary changes to support Skia.
 * @see [Documentation](https://www.remotion.dev/docs/skia/enable-skia)
 */
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
