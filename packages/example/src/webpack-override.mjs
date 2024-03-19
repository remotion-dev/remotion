import {enableTailwind} from '@remotion/tailwind';
import path from 'node:path';

const WEBPACK_OR_ESBUILD = 'esbuild';

/**
 * @typedef {import('@remotion/bundler').WebpackOverrideFn} WebpackOverrideFn
 */
export const webpackOverride = (currentConfiguration) => {
	const replaced = (() => {
		if (WEBPACK_OR_ESBUILD === 'webpack') {
			const {replaceLoadersWithBabel} = require(
				path.join(
					// eslint-disable-next-line no-undef
					process.cwd(),
					'..',
					'..',
					'example',
					'node_modules',
					'@remotion/babel-loader',
				),
			);
			return replaceLoadersWithBabel(currentConfiguration);
		}

		return currentConfiguration;
	})();
	return enableTailwind({
		...replaced,
		module: {
			...replaced.module,
			rules: [
				...(replaced.module?.rules ?? []),
				{
					test: /\.mdx?$/,
					use: [
						{
							loader: '@mdx-js/loader',
							options: {},
						},
					],
				},
			],
		},
		resolve: {
			...replaced.resolve,
			alias: {
				...replaced.resolve.alias,
				// eslint-disable-next-line no-undef
				lib: path.join(process.cwd(), 'src', 'lib'),

				// ES Modules need to be generated with `pnpm build` in every package
				// So if you just make a change while you run `pnpm watch`, you don't see the difference
				// which is confusing for contributors
				'@remotion/gif': require.resolve('@remotion/gif'),
				'@remotion/layout-utils': require.resolve('@remotion/layout-utils'),
				'@remotion/lottie': require.resolve('@remotion/lottie'),
				'@remotion/media-utils': require.resolve('@remotion/media-utils'),
				'@remotion/motion-blur': require.resolve('@remotion/motion-blur'),
				'@remotion/noise': require.resolve('@remotion/noise'),
				'@remotion/paths': require.resolve('@remotion/paths'),
				'@remotion/player': require.resolve('@remotion/player'),
				'@remotion/preload': require.resolve('@remotion/preload'),
				'@remotion/rive': require.resolve('@remotion/rive'),
				'@remotion/shapes': require.resolve('@remotion/shapes'),
				'@remotion/skia': require.resolve('@remotion/skia'),
				'@remotion/three': require.resolve('@remotion/three'),
				'@remotion/zod-types': require.resolve('@remotion/zod-types'),
			},
		},
	});
};
