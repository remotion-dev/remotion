import {Config} from '@remotion/cli';
import {webpackOverride} from './src/webpack-override';

Config.Output.setOverwriteOutput(true);
Config.Bundling.overrideWebpackConfig(webpackOverride);
