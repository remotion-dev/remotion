import {Config} from 'remotion';

Config.Rendering.setConcurrency((require('os').cpus() || {length: 1}).length);
Config.Output.setOverwriteOutput(true);
