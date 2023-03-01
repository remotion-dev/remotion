import {Config} from 'remotion';
import {webpackOverride} from './src/webpack-override';

Config.setOverwriteOutput(true);
Config.Bundling.overrideWebpackConfig(webpackOverride);
