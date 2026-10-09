/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('angle');
Config.setDefaultPremountInSeconds(2);
Config.setExperimentalTracksEnabled(true);
Config.setExperimentalSequenceActivityEnabled(true);
Config.setShowPremounting(false);
Config.setExperimentalSequenceActivityLimit(150);
