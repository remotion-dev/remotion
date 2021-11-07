import {Config} from 'remotion';
import {webpackOverride} from './webpack-override';

Config.Rendering.setParallelEncoding(true);
Config.Output.setOverwriteOutput(true);
Config.Bundling.overrideWebpackConfig(webpackOverride);
