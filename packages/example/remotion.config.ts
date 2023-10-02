import {Config} from '@remotion/cli/config';
import {webpackOverride} from './src/webpack-override.mjs';

Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(webpackOverride);
