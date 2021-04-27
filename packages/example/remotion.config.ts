import os from 'os';
import path from 'path';
import {Config, WebpackOverrideFn} from 'remotion';

Config.Rendering.setConcurrency(os.cpus().length);
Config.Output.setOverwriteOutput(true);

type Bundler = 'webpack' | 'esbuild';

const WEBPACK_OR_ESBUILD = 'esbuild' as Bundler;

export const webpackOverride: WebpackOverrideFn = (currentConfiguration) => {
	const replaced = (() => {
		const {replaceLoadersWithBabel} = require(path.join(
			__dirname,
			'..',
			'..',
			'example',
			'node_modules',
			'@remotion/babel-loader'
		));
		if (WEBPACK_OR_ESBUILD === 'webpack') {
			return replaceLoadersWithBabel(currentConfiguration);
		}
		return currentConfiguration;
	})();
	return {
		...replaced,
		module: {
			...replaced.module,
			rules: [
				...(replaced.module?.rules ?? []),
				{
					test: /\.mdx?$/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [
									'@babel/preset-env',
									[
										'@babel/preset-react',
										{
											runtime: 'automatic',
										},
									],
								],
							},
						},
						'mdx-loader',
					],
				},
			],
		},
	};
};

Config.Bundling.overrideWebpackConfig(webpackOverride);
