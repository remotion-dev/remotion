import {enableScss} from '@remotion/enable-scss';
import {enableSkia} from '@remotion/skia/enable';
import {enableTailwind} from '@remotion/tailwind-v4';

import path from 'node:path';

const WEBPACK_OR_ESBUILD = 'esbuild';

const resolveCwd = (p) => {
	return require.resolve(p, {
		paths: [path.join(process.cwd(), 'node_modules')],
	});
};

const aliases = {
	'@remotion/gif': resolveCwd('@remotion/gif'),
	'@remotion/layout-utils': resolveCwd('@remotion/layout-utils'),
	'@remotion/lottie': resolveCwd('@remotion/lottie'),
	'@remotion/media-utils': resolveCwd('@remotion/media-utils'),
	'@remotion/motion-blur': resolveCwd('@remotion/motion-blur'),
	'@remotion/noise': resolveCwd('@remotion/noise'),
	'@remotion/paths': resolveCwd('@remotion/paths'),
	'@remotion/fonts': resolveCwd('@remotion/fonts'),
	'@remotion/player': resolveCwd('@remotion/player'),
	'@remotion/preload': resolveCwd('@remotion/preload'),
	'@remotion/rive': resolveCwd('@remotion/rive'),
	'@remotion/shapes': resolveCwd('@remotion/shapes'),
	'@remotion/studio/internals': resolveCwd('@remotion/studio/internals'),
	'@remotion/studio': resolveCwd('@remotion/studio'),
	'@remotion/animated-emoji': resolveCwd('@remotion/animated-emoji'),
	'@remotion/skia': resolveCwd('@remotion/skia'),
	'@remotion/three': resolveCwd('@remotion/three'),
	'@remotion/webcodecs': resolveCwd('@remotion/webcodecs'),
	'@remotion/media-parser/fetch': resolveCwd('@remotion/media-parser/fetch'),
	'@remotion/media-parser/web-file': resolveCwd(
		'@remotion/media-parser/web-file',
	),
	'@remotion/media-parser': resolveCwd('@remotion/media-parser'),
	'@remotion/transitions/fade': resolveCwd('@remotion/transitions/fade'),
	'@remotion/transitions/slide': resolveCwd('@remotion/transitions/slide'),
	'@remotion/transitions/flip': resolveCwd('@remotion/transitions/flip'),
	'@remotion/transitions/clock-wipe': resolveCwd(
		'@remotion/transitions/clock-wipe',
	),
	'@remotion/transitions/wipe': resolveCwd('@remotion/transitions/wipe'),
	'@remotion/transitions': resolveCwd('@remotion/transitions'),
	'@remotion/zod-types': resolveCwd('@remotion/zod-types'),
};

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
	return enableScss(
		enableSkia(
			enableTailwind({
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
						...aliases,
					},
				},
			}),
		),
	);
};
