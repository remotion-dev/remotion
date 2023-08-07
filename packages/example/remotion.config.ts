import {Config} from '@remotion/cli/config';
import {webpackOverride} from './src/webpack-override';

Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(webpackOverride);
