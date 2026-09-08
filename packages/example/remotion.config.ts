import {Config} from '@remotion/cli/config';
import {bundlerOverride} from './src/webpack-override.mjs';

Config.setOverwriteOutput(true);
Config.setRspack(true);
Config.overrideBundlerConfig(async (config) => {
	await new Promise((resolve) => {
		setTimeout(resolve, 10);
	});
	return bundlerOverride(config);
});
Config.setEnableCrossSiteIsolation(true);
Config.addElementLibrary({
	url: 'https://remocn.dev/docs/typography',
	displayName: 'Remocn',
});
Config.addElementLibrary({
	url: 'http://localhost:3002/elements',
	displayName: 'Local Elements',
});
