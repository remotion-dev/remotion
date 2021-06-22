import {Config} from 'remotion';

Config.Rendering.setConcurrency(require('os').cpus().length);
Config.Output.setOverwriteOutput(true);
