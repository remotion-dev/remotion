/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */
import {enableSkia} from '@remotion/skia/enable';
import {Config} from '@remotion/cli/config';

Config.setRspack(true);
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

Config.overrideBundlerConfig((config, context) => {
	return enableSkia(config, context);
});

Config.setConcurrency(2);
Config.setChromiumOpenGlRenderer('angle');
