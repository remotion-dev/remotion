import path from 'path';
import {Config} from 'remotion';
import {webpackOverride} from './webpack-override';

Config.Output.setOverwriteOutput(true);
Config.Bundling.overrideWebpackConfig(webpackOverride);
Config.Bundling.overrideWebpackConfig((config) => {
	const newConfig = webpackOverride(config);
	return {
		...newConfig,
		resolve: {
			...newConfig.resolve,
			alias: {
				...newConfig.resolve.alias,
				'lib/alias': require.resolve(
					path.join(process.cwd(), 'src', 'lib', 'alias.ts')
				),
			},
		},
	};
});
