import {Config} from 'remotion';
import {webpackOverride} from './src/webpack-override';

Config.Output.setOutputLocation('out/video.mp4');
Config.Output.setOverwriteOutput(true);
Config.Bundling.overrideWebpackConfig(webpackOverride);
