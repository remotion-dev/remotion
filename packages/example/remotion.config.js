import {Config} from 'remotion';

Config.setConcurrency(require('os').cpus().length);
Config.Output.setOverwriteOutput(true);
