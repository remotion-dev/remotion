import os from 'os';
import {Config} from 'remotion';

Config.Rendering.setConcurrency(os.cpus().length);
Config.Rendering.setImageFormat('png');
Config.Output.setOverwriteOutput(true);
Config.Output.setPixelFormat('yuva420p');
Config.Output.setCodec('vp8');

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
