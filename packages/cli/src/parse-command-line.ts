import minimist from 'minimist';
import {Config, PixelFormat} from 'remotion';

export type CommandLineOptions = {
	pixelFormat: PixelFormat;
	concurrency: number;
	overwrite: boolean;
	config: string;
};

export const parsedCli = minimist<CommandLineOptions>(process.argv.slice(2));

export const parseCommandLine = () => {
	if (parsedCli.pixelFormat) {
		Config.PixelFormat.setPixelFormat(parsedCli.pixelFormat);
	}
	if (parsedCli.concurrency) {
		Config.Concurrency.setConcurrency(parsedCli.concurrency);
	}
	Config.Output.setOverwriteOutput(parsedCli.overwrite);
};
