import {Config} from '@remotion/cli/config';
import {enableScss} from '@remotion/enable-scss';
import {webpackOverride} from './src/webpack-override.mjs';

Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(async (config) => {
	await new Promise((resolve) => {
		setTimeout(resolve, 10);
	});
	return enableScss(await webpackOverride(config));
});
