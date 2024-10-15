/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */
import {enableSkia} from '@remotion/skia/enable';
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig((config) => {
	return enableSkia(config);
});

Config.setConcurrency(2);
Config.setChromiumOpenGlRenderer('angle');
