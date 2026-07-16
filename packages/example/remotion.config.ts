import {existsSync} from 'node:fs';
import {Config} from '@remotion/cli/config';
import {webpackOverride} from './src/webpack-override.mjs';

const chromeCanaryExecutable =
	'/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary';

if (existsSync(chromeCanaryExecutable)) {
	Config.setBrowserExecutable(chromeCanaryExecutable);
}

Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(async (config) => {
	await new Promise((resolve) => {
		setTimeout(resolve, 10);
	});
	return webpackOverride(config);
});

Config.setExperimentalClientSideRenderingEnabled(true);
