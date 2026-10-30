import {Config} from '@remotion/cli/config';
import {bundlerOverride} from './src/webpack-override.mjs';

Config.setOverwriteOutput(true);
const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
Config.setRspack(
	typeof Bun !== 'undefined' ||
		(nodeMajor === 20 && nodeMinor >= 19) ||
		(nodeMajor === 22 && nodeMinor >= 12) ||
		nodeMajor > 22,
);
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
	captionStylesUrl: 'http://localhost:3002/elements/captions',
});
