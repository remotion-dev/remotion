import {enableTailwind} from '@remotion/tailwind';
import path from 'node:path';

const WEBPACK_OR_ESBUILD = 'esbuild';

/**
 * @typedef {import('@remotion/bundler').WebpackOverrideFn} WebpackOverrideFn
 */
export const webpackOverride = (currentConfiguration) => {
	const replaced = (() => {
		if (WEBPACK_OR_ESBUILD === 'webpack') {
			const {replaceLoadersWithBabel} = require(path.join(
				// eslint-disable-next-line no-undef
				process.cwd(),
				'..',
				'..',
				'example',
				'node_modules',
				'@remotion/babel-loader',
			));
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
			},
		},
	});
};
