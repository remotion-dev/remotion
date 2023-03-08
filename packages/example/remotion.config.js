import {Config} from '@remotion/cli/config';

Config.setConcurrency(require('os').cpus().length);
Config.Output.setOverwriteOutput(true);
