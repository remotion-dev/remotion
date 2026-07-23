/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import type {WebpackConfiguration} from '@remotion/bundler';
import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind-v4';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('angle');
Config.overrideBundlerConfig((config) =>
	enableTailwind(config as WebpackConfiguration),
);
