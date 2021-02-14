import {overrideWebpackConfig} from '@remotion/bundler';
import {Config} from 'remotion';

Config.Concurrency.setConcurrency(16);
Config.Output.setOverwriteOutput(true);
Config.PixelFormat.setPixelFormat('yuv420p');

overrideWebpackConfig((currentConfiguration) => {
	return {
		...currentConfiguration,
		module: {
			...currentConfiguration.module,
			rules: [
				...currentConfiguration.module.rules,
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
