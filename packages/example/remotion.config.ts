import os from 'os';
import path from 'path';
import {Config} from 'remotion';

Config.Rendering.setConcurrency(os.cpus().length);
Config.Output.setOverwriteOutput(true);

type Bundler = 'webpack' | 'esbuild';

const WEBPACK_OR_ESBUILD = 'esbuild' as Bundler;

Config.Puppeteer.setBrowserExecutable(
	'/Users/jonnyburger/chromium/src/out/Default/Chromium.app/Contents/MacOS/Chromium'
);

Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
	const {replaceLoadersWithBabel} = require(path.join(
		__dirname,
		'..',
		'..',
		'example',
		'node_modules',
		'@remotion/babel-loader'
	));

	const replaced =
		WEBPACK_OR_ESBUILD === 'webpack'
			? replaceLoadersWithBabel(currentConfiguration)
			: currentConfiguration;
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
});
