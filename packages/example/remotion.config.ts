import {Config} from 'remotion';
import {webpackOverride} from './webpack-override';

Config.Output.setOverwriteOutput(true);
Config.Bundling.overrideWebpackConfig(webpackOverride);
