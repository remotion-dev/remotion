import {Config} from 'remotion';
import {webpackOverride} from './src/webpack-override';

Config.Output.setOverwriteOutput(true);
Config.Bundling.overrideWebpackConfig(webpackOverride);

Config.Preview.setNumberOfSharedAudioTags(3);
