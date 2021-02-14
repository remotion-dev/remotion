import minimist from 'minimist';
import {Config, PixelFormat} from 'remotion';

export type CommandLineOptions = {
	pixelFormat: PixelFormat;
	concurrency: number;
	overwrite: boolean;
	config: string;
	png: boolean;
	quality: number | undefined;
	force: boolean;
	props: string;
};

export const parsedCli = minimist<CommandLineOptions>(process.argv.slice(2));

export const parseCommandLine = () => {
	if (parsedCli.pixelFormat) {
		Config.Output.setPixelFormat(parsedCli.pixelFormat);
	}
	if (parsedCli.concurrency) {
		Config.Rendering.setConcurrency(parsedCli.concurrency);
	}
	if (parsedCli.png) {
		Config.Output.setOutputFormat('png-sequence');
	}
	if (typeof parsedCli.overwrite !== 'undefined') {
		Config.Output.setOverwriteOutput(parsedCli.overwrite);
	}
	if (typeof parsedCli.quality !== 'undefined') {
		Config.Rendering.setQuality(parsedCli.quality);
	}
};
