import {Config} from '@remotion/cli/config';
import {webpackOverride} from './src/webpack-override.mjs';

Config.setOverwriteOutput(true);
Config.setExperimentalRspackEnabled(true);
Config.overrideWebpackConfig(async (config) => {
	await new Promise((resolve) => {
		setTimeout(resolve, 10);
	});
	return webpackOverride(config);
});
Config.overrideRspackConfig(webpackOverride);
