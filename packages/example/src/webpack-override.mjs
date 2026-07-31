import path from 'node:path';
import {enableScss} from '@remotion/enable-scss';
import {enableSkia} from '@remotion/skia/enable';
import {enableTailwind} from '@remotion/tailwind-v4';

const WEBPACK_OR_ESBUILD = 'esbuild';

/** @type {import('@remotion/bundler').BundlerOverrideFn} */
export const bundlerOverride = (currentConfiguration) => {
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
					},
				},
			}),
		),
	);
};
