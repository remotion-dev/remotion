import fs from 'fs';
import type {BundlerConfiguration, BundlerName} from '@remotion/bundler';
import {webpack} from '@remotion/bundler';

/**
 * @description A function that modifies the default Webpack configuration to make the necessary changes to support Skia.
 * @see [Documentation](https://www.remotion.dev/docs/skia/enable-skia)
 */
export const enableSkia = <Configuration extends BundlerConfiguration>(
	currentConfiguration: Configuration,
	{bundler}: {bundler: BundlerName} = {bundler: 'webpack'},
): Configuration => {
	const newExtensions = [
		'.web.js',
		'.web.ts',
		'.web.tsx',
		...(currentConfiguration.resolve?.extensions ?? []),
	];

	const deduplicatedExtensions = [...new Set(newExtensions)];

	return {
		...currentConfiguration,
		ignoreWarnings: [
			...(currentConfiguration.ignoreWarnings ?? []),
			...(bundler === 'rspack' ? [/react-native-reanimated/] : []),
		],
		plugins: [
			...(currentConfiguration.plugins ?? []),
			new (class CopySkiaPlugin {
				apply(compiler: webpack.Compiler) {
					compiler.hooks.thisCompilation.tap('AddSkiaPlugin', (compilation) => {
						compilation.hooks.processAssets.tapPromise(
							{
								name: 'copy-skia',
								stage:
									compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
							},
							async () => {
								const src =
									require.resolve('canvaskit-wasm/bin/full/canvaskit.wasm');
								if (compilation.getAsset(src)) {
									// Skip emitting the asset again because it's immutable
									return;
								}

								compilation.emitAsset(
									'/canvaskit.wasm',
									new webpack.sources.RawSource(
										await fs.promises.readFile(src),
									),
								);
							},
						);
					});
				}
			})(),
		],
		resolve: {
			...currentConfiguration.resolve,
			// FIXME: To fix missing modules in browser when using webassembly
			fallback: {
				fs: false,
				path: false,
			},
			extensions: deduplicatedExtensions,
			alias: {
				...currentConfiguration.resolve?.alias,
				...(bundler === 'webpack'
					? {
							'react-native-reanimated': "require('react-native-reanimated')",
							'react-native-reanimated/lib/reanimated2/core':
								"require('react-native-reanimated/lib/reanimated2/core')",
						}
					: {}),
				'react-native/Libraries/Image/AssetRegistry': false,
			},
		},
	} as Configuration;
};
