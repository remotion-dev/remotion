import minimist from 'minimist';
import {Config, PixelFormat} from 'remotion';
import {CodecOrUndefined} from 'remotion/dist/config/codec';

export type CommandLineOptions = {
	pixelFormat: PixelFormat;
	concurrency: number;
	overwrite: boolean;
	config: string;
	png: boolean;
	sequence: boolean;
	quality: number | undefined;
	force: boolean;
	codec: CodecOrUndefined;
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
		console.warn('The --png flag has been renamed to --sequence.');
		Config.Output.setImageSequence(parsedCli.png);
	}
	if (parsedCli.sequence) {
		Config.Output.setImageSequence(parsedCli.sequence);
	}
	if (parsedCli.codec) {
		Config.Output.setCodec(parsedCli.codec);
	}
	if (typeof parsedCli.overwrite !== 'undefined') {
		Config.Output.setOverwriteOutput(parsedCli.overwrite);
	}
	if (typeof parsedCli.quality !== 'undefined') {
		Config.Rendering.setQuality(parsedCli.quality);
	}
};
