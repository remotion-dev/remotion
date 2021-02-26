import os from 'os';
import {Config} from 'remotion';

Config.Rendering.setConcurrency(os.cpus().length);
Config.Output.setOverwriteOutput(true);
Config.Puppeteer.setBrowser('firefox');

Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
	return {
		...currentConfiguration,
		module: {
			...currentConfiguration.module,
			rules: [
				...(currentConfiguration.module?.rules ?? []),
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
